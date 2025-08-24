// Database operations and Firestore queries
import { db } from './firebase-init.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

class DatabaseManager {
  constructor() {
    // Initialize collections using Firebase v9+ syntax
    this.eventsCollection = collection(db, 'events');
    this.usersCollection = collection(db, 'users');
    this.roomsCollection = collection(db, 'rooms');
    this.certificatesCollection = collection(db, 'certificates');
  }

  // Event operations
  async createEvent(eventData) {
    try {
      const eventDoc = {
        ...eventData,
        imageUrl: null, // No image upload without storage
        attendeeCount: 0, // Explicitly set to 0
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure other potential missing fields are initialized
        capacity: eventData.capacity || null,
        attendees: [], // Optional: add an attendees array
        status: eventData.status || 'upcoming'
      };

      const docRef = await addDoc(this.eventsCollection, eventDoc);
      return { 
        success: true, 
        eventId: docRef.id,
        attendeeCount: 0 // Confirm attendee count is 0
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEvent(eventId, updateData) {
    try {
      const updateDoc = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'events', eventId), updateDoc);
      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteEvent(eventId) {
    try {
      // Delete event document
      await deleteDoc(doc(db, 'events', eventId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }

  async getEvent(eventId) {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return { success: true, event: { id: eventDoc.id, ...eventDoc.data() } };
      } else {
        return { success: false, error: 'Event not found' };
      }
    } catch (error) {
      console.error('Error getting event:', error);
      return { success: false, error: error.message };
    }
  }

  async getEvents(filters = {}, pagination = {}) {
    try {
      let q = query(this.eventsCollection, where('visibility', '==', 'public'));
      
      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }
      if (filters.startDate) {
        q = query(q, where('startAt', '>=', Timestamp.fromDate(new Date(filters.startDate))));
      }
      if (filters.endDate) {
        q = query(q, where('startAt', '<=', Timestamp.fromDate(new Date(filters.endDate))));
      }
      
      // Apply ordering and pagination
      q = query(q, orderBy('startAt', 'asc'));
      if (pagination.limit) {
        q = query(q, limit(pagination.limit));
      }

      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, events, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
    } catch (error) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message };
    }
  }

  async getUpcomingEvents(limit = 12) {
    try {
      const now = Timestamp.now();
      const q = query(
        this.eventsCollection,
        where('visibility', '==', 'public'),
        where('startAt', '>', now),
        orderBy('startAt', 'asc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, events };
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all events
  async getAllEvents() {
    try {
      const q = query(
        this.eventsCollection,
        orderBy('startAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });

      return events;
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  }

  // Registration operations
  async registerForEvent(eventId, userId, userData) {
    try {
      // Validate inputs
      if (!eventId || !userId) {
        throw new Error('Invalid event or user ID');
      }

      // Start a write batch for atomic operations
      const { writeBatch, increment, serverTimestamp } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // Verify event exists and is not full
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event does not exist');
      }

      const eventData = eventDoc.data();
      
      // Check capacity
      if (eventData.capacity && 
          (eventData.attendeeCount || 0) >= eventData.capacity) {
        throw new Error('Event is already full');
      }

      // Detailed logging
      console.log('Registration Attempt:', {
        eventId,
        userId,
        currentAttendeeCount: eventData.attendeeCount || 0,
        capacity: eventData.capacity
      });
      
      // Add to user's registrations
      const userRegRef = doc(db, 'users', userId, 'registrations', eventId);
      batch.set(userRegRef, {
        eventId,
        registeredAt: serverTimestamp(),
        attended: false,
        userData: {
          name: userData.name,
          email: userData.email
        }
      });

      // Add to event's attendees
      const eventAttendeeRef = doc(db, 'events', eventId, 'attendees', userId);
      batch.set(eventAttendeeRef, {
        userId,
        name: userData.name,
        email: userData.email,
        registeredAt: serverTimestamp(),
        status: 'registered',
        attended: false
      });

      // Increment attendee count with validation
      batch.update(eventRef, {
        attendeeCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // Commit batch
      await batch.commit();

      // Verify registration
      const verifyAttendees = await getDocs(
        query(collection(db, 'events', eventId, 'attendees'))
      );

      console.log('Post-Registration Verification:', {
        totalAttendees: verifyAttendees.size,
        registeredUserIds: verifyAttendees.docs.map(doc => doc.id)
      });
      
      return { 
        success: true, 
        emailSent: true, // Simulated
        attendeeCount: (eventData.attendeeCount || 0) + 1
      };
    } catch (error) {
      console.error('Detailed Registration Error:', {
        message: error.message,
        stack: error.stack,
        eventId: eventId,
        userId: userId
      });

      // Specific error handling
      if (error.message === 'Event is already full') {
        return { 
          success: false, 
          error: 'Event capacity reached',
          code: 'capacity-full'
        };
      }

      if (error.message === 'Event does not exist') {
        return { 
          success: false, 
          error: 'Event not found',
          code: 'event-not-found'
        };
      }

      return { 
        success: false, 
        error: error.message,
        code: 'registration-failed'
      };
    }
  }

  async unregisterFromEvent(eventId, userId) {
    try {
      const { writeBatch, increment } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // Remove from user's registrations
      const userRegRef = doc(db, 'users', userId, 'registrations', eventId);
      batch.delete(userRegRef);

      // Remove from event's attendees
      const eventAttendeeRef = doc(db, 'events', eventId, 'attendees', userId);
      batch.delete(eventAttendeeRef);

      // Decrement attendee count
      const eventRef = doc(db, 'events', eventId);
      batch.update(eventRef, {
        attendeeCount: increment(-1)
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error unregistering from event:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserRegistrations(userId) {
    try {
      const registrationsRef = collection(db, 'users', userId, 'registrations');
      const querySnapshot = await getDocs(registrationsRef);
      
      const registrations = [];
      for (const regDoc of querySnapshot.docs) {
        const eventData = await this.getEvent(regDoc.data().eventId);
        if (eventData.success) {
          registrations.push({
            ...regDoc.data(),
            event: eventData.event
          });
        }
      }

      return { success: true, registrations };
    } catch (error) {
      console.error('Error getting user registrations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get admin events
  async getAdminEvents(adminId) {
    try {
      const q = query(
        this.eventsCollection,
        where('createdBy', '==', adminId),
        orderBy('startAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });
      
      return events;
    } catch (error) {
      console.error('Error getting admin events:', error);
      throw error;
    }
  }

  async getEventAttendees(eventId) {
    try {
      const attendeesRef = collection(db, 'events', eventId, 'attendees');
      const querySnapshot = await getDocs(attendeesRef);
      
      const attendees = [];
      querySnapshot.forEach(doc => {
        attendees.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, attendees };
    } catch (error) {
      console.error('Error getting event attendees:', error);
      return { success: false, error: error.message };
    }
  }

  // User operations
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const userUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', userId), userUpdateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async createUserProfile(userId, userData) {
    try {
      const userDoc = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', userId), userDoc);
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Room operations
  async getRooms() {
    try {
      const querySnapshot = await getDocs(this.roomsCollection);
      const rooms = [];
      querySnapshot.forEach(doc => {
        rooms.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, rooms };
    } catch (error) {
      console.error('Error getting rooms:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for scheduling conflicts
  async checkSchedulingConflict(roomId, startAt, endAt, excludeEventId = null) {
    try {
      let q = query(
        this.eventsCollection,
        where('roomId', '==', roomId),
        where('startAt', '<', endAt),
        where('endAt', '>', startAt)
      );

      if (excludeEventId) {
        q = query(q, where('__name__', '!=', excludeEventId));
      }

      const querySnapshot = await getDocs(q);
      return { 
        success: true, 
        hasConflict: !querySnapshot.empty,
        conflictingEvents: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error checking scheduling conflict:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time listeners
  onEventsChange(callback) {
    return onSnapshot(this.eventsCollection, callback);
  }

  onEventChange(eventId, callback) {
    return onSnapshot(doc(db, 'events', eventId), callback);
  }

  onUserRegistrationsChange(userId, callback) {
    return onSnapshot(collection(db, 'users', userId, 'registrations'), callback);
  }

  onEventAttendeesChange(eventId, callback) {
    const attendeesRef = collection(db, 'events', eventId, 'attendees');
    return onSnapshot(attendeesRef, callback);
  }

  async trackEventView(eventId) {
    try {
      const { increment } = await import('firebase/firestore');
      const eventRef = doc(db, 'events', eventId);
      
      await updateDoc(eventRef, {
        viewCount: increment(1)
      });

      return { success: true };
    } catch (error) {
      console.error('Error tracking event view:', error);
      return { success: false, error: error.message };
    }
  }

  async debugEventRegistration(eventId, userId) {
    try {
      // Check event document
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        console.error('Event does not exist');
        return { 
          success: false, 
          error: 'Event does not exist',
          details: null 
        };
      }

      const eventData = eventDoc.data();

      // Check attendees collection
      const attendeesRef = collection(db, 'events', eventId, 'attendees');
      const attendeesQuery = query(attendeesRef, where('userId', '==', userId));
      const attendeesSnapshot = await getDocs(attendeesQuery);

      // Check user registrations
      const userRegRef = doc(db, 'users', userId, 'registrations', eventId);
      const userRegDoc = await getDoc(userRegRef);

      return {
        success: true,
        details: {
          eventId,
          userId,
          eventData,
          attendeeCount: eventData.attendeeCount || 0,
          hasAttendeeRecord: !attendeesSnapshot.empty,
          attendeeRecordCount: attendeesSnapshot.size,
          hasUserRegistration: userRegDoc.exists()
        }
      };
    } catch (error) {
      console.error('Error debugging event registration:', error);
      return { 
        success: false, 
        error: error.message,
        details: null 
      };
    }
  }
}

// Create and export singleton instance
export const dbManager = new DatabaseManager();

// Export individual functions for convenience
export const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getUpcomingEvents,
  registerForEvent,
  unregisterFromEvent,
  getUserRegistrations,
  getAdminEvents,
  getEventAttendees,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getRooms,
  checkSchedulingConflict,
  onEventsChange,
  onEventChange,
  onUserRegistrationsChange,
  onEventAttendeesChange,
  trackEventView,
  debugEventRegistration
} = dbManager;
