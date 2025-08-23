// Authentication and user management
import { auth, db } from './firebase-init.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.authStateListeners = [];
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserRole();
        this.notifyAuthStateChange();
      } else {
        this.currentUser = null;
        this.userRole = null;
        this.notifyAuthStateChange();
      }
    });
  }

  // Sign up new user
  async signUp(email, password, name, role, studentId = null, session = null) {
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        displayName: name,
        email,
        role,
        studentId: studentId || null,
        session: session || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        avatarUrl: null
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load user role from Firestore
  async loadUserRole() {
    if (!this.currentUser) return;
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        this.userRole = userDoc.data().role;
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  }

  // Check if user has specific role
  hasRole(role) {
    return this.userRole && this.userRole.toLowerCase() === role.toLowerCase();
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is student
  isStudent() {
    return this.hasRole('student');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user data
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user role
  getUserRole() {
    return this.userRole;
  }

  // Get user profile from Firestore
  async getUserProfile() {
    try {
      if (!this.currentUser) {
        return null;
      }
      
      const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
      if (userDoc.exists) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Add auth state change listener
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  // Notify all listeners of auth state change
  notifyAuthStateChange() {
    this.authStateListeners.forEach(callback => {
      callback(this.currentUser, this.userRole);
    });
  }

  // Route guard for student-only pages
  requireStudent() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    if (!this.isStudent()) {
      window.location.href = '/admin-dashboard.html';
      return false;
    }
    return true;
  }

  // Route guard for admin-only pages
  requireAdmin() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    if (!this.isAdmin()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  }

  // Route guard for authenticated users
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
}

// Create and export singleton instance
export const authManager = new AuthManager();

// Export individual functions for convenience
export const {
  signUp,
  signIn,
  signOut: signOutUser,
  resetPassword,
  hasRole,
  isAdmin,
  isStudent,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  onAuthStateChange,
  requireStudent,
  requireAdmin,
  requireAuth
} = authManager;
