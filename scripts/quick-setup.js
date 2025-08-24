#!/usr/bin/env node

/**
 * Quick Setup Guide for attendeeCount Field
 * 
 * This script provides step-by-step instructions for manually adding
 * the attendeeCount field to your Firebase events.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Eventify Firebase Setup - Adding attendeeCount Field');
console.log('========================================================');
console.log('');

console.log('📋 This script will guide you through adding the attendeeCount field');
console.log('   to your Firebase events collection.');
console.log('');

console.log('🎯 What we\'re doing:');
console.log('   - Adding attendeeCount field to existing events');
console.log('   - Setting initial values based on current registrations');
console.log('   - Ensuring the field persists across page refreshes');
console.log('');

console.log('🔧 Prerequisites:');
console.log('   ✅ Firebase project: eventify-5e54d');
console.log('   ✅ Firestore database set up');
console.log('   ✅ Events collection with existing events');
console.log('   ✅ Users collection with registrations subcollections');
console.log('');

console.log('📱 Method 1: Firebase Console (Recommended)');
console.log('============================================');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select project: eventify-5e54d');
console.log('3. Click "Firestore Database" in left sidebar');
console.log('4. Go to "Data" tab');
console.log('5. Find your events collection');
console.log('6. For each event document:');
console.log('   - Click on the document');
console.log('   - Add field: attendeeCount (type: number, value: 0)');
console.log('   - Click "Update"');
console.log('7. Repeat for all events');
console.log('');

console.log('💻 Method 2: Firebase CLI Script');
console.log('================================');
console.log('1. Install Firebase CLI: npm install -g firebase-tools');
console.log('2. Login: firebase login');
console.log('3. Set project: firebase use eventify-5e54d');
console.log('4. Download service account key from Firebase Console');
console.log('5. Run: node add-attendee-count.js');
console.log('');

console.log('🧪 After Setup - Testing');
console.log('==========================');
console.log('1. Refresh your Eventify application');
console.log('2. Go to All Events page');
console.log('3. Register for an event');
console.log('4. Verify count increments (e.g., 0 → 1)');
console.log('5. Refresh the page');
console.log('6. Verify count persists (should still be 1)');
console.log('7. Unregister and verify count decrements');
console.log('');

console.log('❌ Common Issues & Solutions');
console.log('=============================');
console.log('• Count resets after refresh: attendeeCount field missing');
console.log('• Permission denied: Check Firestore rules');
console.log('• Field not saving: Ensure field type is "number"');
console.log('• Script errors: Verify Firebase CLI setup');
console.log('');

console.log('🔗 Related Documentation');
console.log('========================');
console.log('• Firestore Rules: firestore.rules');
console.log('• Schema Documentation: README.md');
console.log('• Firebase Config: firebase.json');
console.log('');

console.log('✅ Setup Complete!');
console.log('==================');
console.log('After adding the attendeeCount field:');
console.log('• Attendee counts will persist across page refreshes');
console.log('• Counts will update in real-time when users register/unregister');
console.log('• All pages will show consistent attendee data');
console.log('• The application will work as expected');
console.log('');

console.log('🎉 Your Eventify application should now work properly!');
console.log('   The attendeeCount field will store and display accurate counts.');
console.log('');

rl.question('Press Enter to exit...', () => {
  rl.close();
  console.log('👋 Good luck with your Eventify setup!');
});
