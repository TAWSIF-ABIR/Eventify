// Client-side script to fix user profiles
// This can be run in the browser console to fix the current user's profile

// Function to create a default user profile for the current user
async function fixCurrentUserProfile() {
  try {
    console.log('🔧 Starting user profile fix...');
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('❌ No user is currently signed in');
      return;
    }
    
    const user = auth.currentUser;
    console.log('👤 Current user:', user.email);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📝 User document not found, creating default profile...');
      
      // Create default user profile
      const defaultUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
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
      
      await setDoc(userDocRef, defaultUserData);
      console.log('✅ Default user profile created successfully!');
      console.log('📊 Profile data:', defaultUserData);
      
      // Show success message
      alert('User profile created successfully! You can now log in normally.');
      
    } else {
      console.log('✅ User profile already exists');
      console.log('📊 Profile data:', userDoc.data());
    }
    
  } catch (error) {
    console.error('❌ Error fixing user profile:', error);
    alert('Error creating user profile: ' + error.message);
  }
}

// Function to check current user profile status
async function checkUserProfileStatus() {
  try {
    if (!auth.currentUser) {
      console.log('❌ No user is currently signed in');
      return;
    }
    
    const user = auth.currentUser;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('✅ User profile exists');
      console.log('📊 Profile data:', userDoc.data());
    } else {
      console.log('❌ User profile not found');
      console.log('🔧 Run fixCurrentUserProfile() to create a profile');
    }
    
  } catch (error) {
    console.error('❌ Error checking profile status:', error);
  }
}

// Add functions to window for easy access
window.fixCurrentUserProfile = fixCurrentUserProfile;
window.checkUserProfileStatus = checkUserProfileStatus;

console.log('🔧 User profile fix script loaded!');
console.log('📋 Available functions:');
console.log('  - fixCurrentUserProfile() - Creates a default profile for current user');
console.log('  - checkUserProfileStatus() - Checks if current user has a profile');
console.log('');
console.log('💡 To fix your profile, run: fixCurrentUserProfile()');
