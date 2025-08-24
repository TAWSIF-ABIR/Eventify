#!/usr/bin/env node

/**
 * Firestore Schema Documentation
 * 
 * This script documents the Firestore database schema
 * for user profiles including all the new fields from the signup form.
 */

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
  attendeeCount: 'number',
  imageUrl: 'string',              // Optional
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Room schema
const roomSchema = {
  name: 'string',
  capacity: 'number',
  location: 'string',
  facilities: 'array',             // Array of facility strings
  available: 'boolean',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Registration schema (subcollection of users)
const registrationSchema = {
  eventId: 'string',
  registeredAt: 'timestamp',
  attended: 'boolean',
  status: 'string'                 // 'registered', 'attended', 'cancelled'
};

// Attendee schema (subcollection of events)
const attendeeSchema = {
  userId: 'string',
  name: 'string',
  email: 'string',
  registeredAt: 'timestamp',
  attended: 'boolean',
  status: 'string'
};

console.log('🚀 Firestore Schema Configuration');
console.log('==================================');
console.log('');

console.log('📊 User Profile Schema:');
console.log(JSON.stringify(userProfileSchema, null, 2));
console.log('');

console.log('🎉 Event Schema:');
console.log(JSON.stringify(eventSchema, null, 2));
console.log('');

console.log('🏢 Room Schema:');
console.log(JSON.stringify(roomSchema, null, 2));
console.log('');

console.log('📝 Registration Schema (users/{uid}/registrations/{eventId}):');
console.log(JSON.stringify(registrationSchema, null, 2));
console.log('');

console.log('👥 Attendee Schema (events/{eventId}/attendees/{userId}):');
console.log(JSON.stringify(attendeeSchema, null, 2));
console.log('');

console.log('✅ Schema documentation complete!');
console.log('');
console.log('🔧 To deploy this schema to Firebase:');
console.log('   1. Run: firebase deploy --only firestore:rules');
console.log('   2. Run: firebase deploy --only firestore:indexes');
console.log('   3. Create sample data using the admin dashboard');
console.log('');
console.log('📋 All signup form fields are included in the user schema:');
console.log('   - email, displayName, studentId, session, phone');
console.log('   - department, bio (fillable in profile page)');
console.log('   - role, profileComplete, timestamps');
