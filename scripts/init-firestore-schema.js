#!/usr/bin/env node

/**
 * Firestore Schema Initialization Script
 * 
 * This script initializes the Firestore database with proper schema
 * and adds missing fields like attendeeCount to existing events.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://eventify-5e54d.firebaseio.com'
});

const db = admin.firestore();

// User profile schema with all fields from signup form
const userProfileSchema = {
  uid: 'string',                    // Firebase Auth UID
  email: 'string',                  // User email (required)
  displayName: 'string',            // Full name from signup
  role: 'string',                   // 'student' or 'admin'
  studentId: 'string',              // Student ID from signup
  session: 'string',                // Academic session (e.g., '2024-2025')
  phone: 'string',                  // Phone number from signup
  department: 'string',             // Department (optional, filled later)
  bio: 'string',                    // User bio (optional, filled later)
  profileComplete: 'boolean',       // Whether profile is complete
  createdAt: 'timestamp',           // Account creation timestamp
  updatedAt: 'timestamp'            // Last update timestamp
};

// Event schema
const eventSchema = {
  title: 'string',
  description: 'string',
  startAt: 'timestamp',
  endAt: 'timestamp',
  location: 'string',
  category: 'string',
  visibility: 'string',            // 'public' or 'private'
  createdBy: 'string',             // UID of creator
  attendeeCount: 'number',         // Number of registered attendees
  capacity: 'number',              // Maximum capacity (optional)
  imageUrl: 'string',              // Optional
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Registration schema (subcollection of users)
const registrationSchema = {
  eventId: 'string',
  eventTitle: 'string',            // Event title for easy reference
  eventDate: 'timestamp',          // Event date
  registeredAt: 'timestamp',       // When user registered
  status: 'string'                 // 'registered', 'attended', 'cancelled'
};

console.log('🚀 Firestore Schema Initialization');
console.log('==================================');
console.log('');

console.log('📊 User Profile Schema:');
console.log(JSON.stringify(userProfileSchema, null, 2));
console.log('');

console.log('🎉 Event Schema:');
console.log(JSON.stringify(eventSchema, null, 2));
console.log('');

console.log('📝 Registration Schema (users/{uid}/registrations/{eventId}):');
console.log(JSON.stringify(registrationSchema, null, 2));
console.log('');

// Function to add attendeeCount field to existing events
async function addAttendeeCountToEvents() {
  try {
    console.log('🔧 Adding attendeeCount field to existing events...');
    
    const eventsRef = db.collection('events');
    const eventsSnapshot = await eventsRef.get();
    
    if (eventsSnapshot.empty) {
      console.log('✅ No events found to update');
      return;
    }
    
    const batch = db.batch();
    let updatedCount = 0;
    
    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();
      
      // Check if attendeeCount field exists
      if (eventData.attendeeCount === undefined) {
        // Calculate real attendee count from registrations
        let realAttendeeCount = 0;
        
        try {
          // Get all users and count registrations for this event
          const usersRef = db.collection('users');
          const usersSnapshot = await usersRef.get();
          
          for (const userDoc of usersSnapshot.docs) {
            const userRegistrationsRef = userDoc.ref.collection('registrations');
            const eventRegistrationQuery = userRegistrationsRef.where('eventId', '==', eventDoc.id);
            const eventRegistrationSnapshot = await eventRegistrationQuery.get();
            
            if (!eventRegistrationSnapshot.empty) {
              realAttendeeCount += eventRegistrationSnapshot.size;
            }
          }
        } catch (error) {
          console.log(`⚠️  Could not calculate real count for event ${eventDoc.id}, setting to 0`);
          realAttendeeCount = 0;
        }
        
        // Add attendeeCount field
        batch.update(eventDoc.ref, {
          attendeeCount: realAttendeeCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updatedCount++;
        console.log(`📝 Event "${eventData.title}" updated with attendeeCount: ${realAttendeeCount}`);
      }
    }
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updatedCount} events with attendeeCount field`);
    } else {
      console.log('✅ All events already have attendeeCount field');
    }
    
  } catch (error) {
    console.error('❌ Error updating events:', error);
  }
}

// Function to create sample event with proper schema
async function createSampleEvent() {
  try {
    console.log('🔧 Creating sample event with proper schema...');
    
    const sampleEvent = {
      title: 'Sample University Event',
      description: 'This is a sample event to demonstrate the proper schema',
      startAt: admin.firestore.Timestamp.fromDate(new Date('2024-12-25T10:00:00')),
      endAt: admin.firestore.Timestamp.fromDate(new Date('2024-12-25T12:00:00')),
      location: 'University Auditorium',
      category: 'Academic',
      visibility: 'public',
      createdBy: 'admin',
      attendeeCount: 0,  // Initialize with 0 attendees
      capacity: 100,     // Optional capacity
      imageUrl: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const eventRef = await db.collection('events').add(sampleEvent);
    console.log(`✅ Sample event created with ID: ${eventRef.id}`);
    console.log('📊 Event data:', JSON.stringify(sampleEvent, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating sample event:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Firestore schema initialization...\n');
    
    // Add attendeeCount to existing events
    await addAttendeeCountToEvents();
    console.log('');
    
    // Create sample event (optional)
    const createSample = process.argv.includes('--create-sample');
    if (createSample) {
      await createSampleEvent();
      console.log('');
    }
    
    console.log('✅ Schema initialization complete!');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('   2. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('   3. Test the application - attendeeCount should now work properly');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
