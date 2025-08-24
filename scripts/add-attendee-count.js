#!/usr/bin/env node

/**
 * Add attendeeCount Field to Existing Events
 * 
 * This script adds the attendeeCount field to existing events in Firestore.
 * Run this after setting up Firebase CLI: firebase login
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Adding attendeeCount field to existing events...');
console.log('==================================================');
console.log('');

// Check if Firebase CLI is installed and logged in
try {
  console.log('🔍 Checking Firebase CLI status...');
  const firebaseStatus = execSync('firebase projects:list', { encoding: 'utf8' });
  console.log('✅ Firebase CLI is available');
} catch (error) {
  console.error('❌ Firebase CLI not available or not logged in');
  console.log('');
  console.log('🔧 Please install and login to Firebase CLI:');
  console.log('   1. npm install -g firebase-tools');
  console.log('   2. firebase login');
  console.log('   3. firebase use eventify-5e54d');
  console.log('');
  process.exit(1);
}

// Create a temporary script to run in Firebase
const tempScript = `
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
          console.log(\`⚠️  Could not calculate real count for event \${eventDoc.id}, setting to 0\`);
          realAttendeeCount = 0;
        }
        
        // Add attendeeCount field
        batch.update(eventDoc.ref, {
          attendeeCount: realAttendeeCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updatedCount++;
        console.log(\`📝 Event "\${eventData.title}" updated with attendeeCount: \${realAttendeeCount}\`);
      }
    }
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(\`✅ Successfully updated \${updatedCount} events with attendeeCount field\`);
    } else {
      console.log('✅ All events already have attendeeCount field');
    }
    
  } catch (error) {
    console.error('❌ Error updating events:', error);
  }
}

// Run the function
addAttendeeCountToEvents().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
`;

// Write temporary script
const tempScriptPath = path.join(__dirname, 'temp-add-attendee-count.js');
fs.writeFileSync(tempScriptPath, tempScript);

console.log('📝 Created temporary script for Firebase execution');
console.log('');

console.log('🔧 Next steps:');
console.log('   1. Download your Firebase service account key:');
console.log('      - Go to Firebase Console > Project Settings > Service Accounts');
console.log('      - Click "Generate New Private Key"');
console.log('      - Save as "serviceAccountKey.json" in the scripts folder');
console.log('');
console.log('   2. Install Firebase Admin SDK:');
console.log('      cd scripts && npm install');
console.log('');
console.log('   3. Run the script:');
console.log('      node temp-add-attendee-count.js');
console.log('');
console.log('   4. Clean up:');
console.log('      rm temp-add-attendee-count.js serviceAccountKey.json');
console.log('');

console.log('📋 Alternative approach using Firebase Console:');
console.log('   1. Go to Firebase Console > Firestore Database');
console.log('   2. Find each event document');
console.log('   3. Add field: attendeeCount (number) with value 0');
console.log('   4. Save the document');
console.log('');

console.log('🎯 The attendeeCount field will be used by the application to:');
console.log('   - Show accurate attendee counts on all pages');
console.log('   - Update counts when users register/unregister');
console.log('   - Persist counts across page refreshes');
console.log('   - Sync data across all pages consistently');
console.log('');

console.log('✅ Script setup complete!');
console.log('   Follow the steps above to add attendeeCount to your events.');
