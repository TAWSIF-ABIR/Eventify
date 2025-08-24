// Script to fix existing users who don't have Firestore profiles
// This script creates default user profiles for existing Firebase Auth users

import { initializeApp } from 'firebase/app';
import { getAuth, listUsers } from 'firebase-admin/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = require('../functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://eventify-5e54d.firebaseio.com"
});

const auth = admin.auth();
const db = admin.firestore();

async function fixUserProfiles() {
  try {
    console.log('Starting user profile fix...');
    
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const userRecord of listUsersResult.users) {
      try {
        // Check if user document exists in Firestore
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
          // Create default user profile
          const defaultUserData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || 'User',
            role: 'student', // Default to student role
            studentId: '',
            session: '',
            phone: '',
            department: '',
            bio: '',
            profileComplete: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await userDocRef.set(defaultUserData);
          console.log(`✅ Created profile for user: ${userRecord.email}`);
          fixedCount++;
        } else {
          console.log(`⏭️  Profile already exists for user: ${userRecord.email}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userRecord.email}:`, error);
      }
    }
    
    console.log('\n🎉 User profile fix completed!');
    console.log(`✅ Fixed: ${fixedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    
  } catch (error) {
    console.error('❌ Error in fixUserProfiles:', error);
  }
}

// Run the fix
fixUserProfiles().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
