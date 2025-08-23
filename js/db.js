// Database operations and Firestore queries
import { db } from './firebase-init.js';

class DatabaseManager {
  constructor() {
    this.eventsCollection = db.collection('events');
    this.usersCollection = db.collection('users');
    this.roomsCollection = db.collection('rooms');
    this.certificatesCollection = db.collection('certificates');
  }

  // Event operations
  async createEvent(eventData) {
    try {
      const eventDoc = {
        ...eventData,
        imageUrl: null, // No image upload without storage
        attendeeCount: 0,
        createdAt: db.FieldValue.serverTimestamp(),
        updatedAt: db.FieldValue.serverTimestamp()
      };

      const docRef = await this.eventsCollection.add(eventDoc);
      return { success: true, eventId: docRef.id };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEvent(eventId, updateData) {
    try {
      const updateDoc = {
        ...updateData,
        updatedAt: db.FieldValue.serverTimestamp()
      };

      await this.eventsCollection.doc(eventId).update(updateDoc);
      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteEvent(eventId) {
    try {
      // Delete event document
      await this.eventsCollection.doc(eventId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }

  async getEvent(eventId) {
    try {
      const eventDoc = await this.eventsCollection.doc(eventId).get();
      if (eventDoc.exists) {
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
      let q = this.eventsCollection.where('visibility', '==', 'public');
      
      // Apply filters
      if (filters.category) {
        q = q.where('category', '==', filters.category);
      }
      if (filters.location) {
        q = q.where('location', '==', filters.location);
      }
      if (filters.startDate) {
        q = q.where('startAt', '>=', db.Timestamp.fromDate(new Date(filters.startDate)));
      }
      if (filters.endDate) {
        q = q.where('startAt', '<=', db.Timestamp.fromDate(new Date(filters.endDate)));
      }
      
      // Apply ordering and pagination
      q = q.orderBy('startAt', 'asc');
      if (pagination.limit) {
        q = q.limit(pagination.limit);
      }
      if (pagination.startAfter) {
        q = q.startAfter(pagination.startAfter);
      }

      const querySnapshot = await q.get();
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
      const now = db.Timestamp.now();
      const q = this.eventsCollection
        .where('visibility', '==', 'public')
        .where('startAt', '>', now)
        .orderBy('startAt', 'asc')
        .limit(limit);

      const querySnapshot = await q.get();
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
      const q = this.eventsCollection
        .orderBy('startAt', 'desc');

      const querySnapshot = await q.get();
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
      const batch = db.batch();
      
      // Add to user's registrations
      const userRegRef = db.collection('users').doc(userId).collection('registrations').doc(eventId);
      batch.set(userRegRef, {
        eventId,
        registeredAt: db.FieldValue.serverTimestamp(),
        attended: false
      });

      // Add to event's attendees
      const eventAttendeeRef = db.collection('events').doc(eventId).collection('attendees').doc(userId);
      batch.set(eventAttendeeRef, {
        userId,
        name: userData.name,
        email: userData.email,
        registeredAt: db.FieldValue.serverTimestamp(),
        status: 'registered',
        attended: false
      });

      // Increment attendee count
      const eventRef = db.collection('events').doc(eventId);
      batch.update(eventRef, {
        attendeeCount: db.FieldValue.increment(1)
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error registering for event:', error);
      return { success: false, error: error.message };
    }
  }

  async unregisterFromEvent(eventId, userId) {
    try {
      const batch = db.batch();
      
      // Remove from user's registrations
      const userRegRef = db.collection('users').doc(userId).collection('registrations').doc(eventId);
      batch.delete(userRegRef);

      // Remove from event's attendees
      const eventAttendeeRef = db.collection('events').doc(eventId).collection('attendees').doc(userId);
      batch.delete(eventAttendeeRef);

      // Decrement attendee count
      const eventRef = db.collection('events').doc(eventId);
      batch.update(eventRef, {
        attendeeCount: db.FieldValue.increment(-1)
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
      const registrationsRef = db.collection('users').doc(userId).collection('registrations');
      const querySnapshot = await registrationsRef.get();
      
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
      const q = this.eventsCollection
        .where('createdBy', '==', adminId)
        .orderBy('startAt', 'desc');
      
      const querySnapshot = await q.get();
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
      const attendeesRef = db.collection('events').doc(eventId).collection('attendees');
      const querySnapshot = await attendeesRef.get();
      
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
  async updateUserProfile(userId, updateData) {
    try {
      const updateDoc = {
        ...updateData,
        updatedAt: db.FieldValue.serverTimestamp()
      };

      await this.usersCollection.doc(userId).update(updateDoc);
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Room operations
  async getRooms() {
    try {
      const querySnapshot = await this.roomsCollection.get();
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
      let q = this.eventsCollection
        .where('roomId', '==', roomId)
        .where('startAt', '<', endAt)
        .where('endAt', '>', startAt);

      if (excludeEventId) {
        q = q.where('__name__', '!=', excludeEventId);
      }

      const querySnapshot = await q.get();
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
    return this.eventsCollection.onSnapshot(callback);
  }

  onEventChange(eventId, callback) {
    return db.collection('events').doc(eventId).onSnapshot(callback);
  }

  onUserRegistrationsChange(userId, callback) {
    return db.collection('users').doc(userId).collection('registrations').onSnapshot(callback);
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
  updateUserProfile,
  getRooms,
  checkSchedulingConflict,
  onEventsChange,
  onEventChange,
  onUserRegistrationsChange
} = dbManager;
