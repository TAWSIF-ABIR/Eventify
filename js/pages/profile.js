import { authManager } from '../auth.js';
import { dbManager } from '../db.js';
import { uiManager } from '../ui.js';
import { toast } from '../toast.js';

class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.init();
    }

    async init() {
        try {
            // Check authentication
            await this.checkAuth();
            
            // Setup UI
            this.setupUI();
            
            // Load user profile
            await this.loadUserProfile();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing ProfilePage:', error);
            toast.error('Failed to initialize page');
        }
    }

    async checkAuth() {
        try {
            this.currentUser = await authManager.getCurrentUser();
            if (!this.currentUser) {
                window.location.href = 'login.html';
                return;
            }
            
            // Update user info in sidebar
            this.updateUserInfo();
            
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        }
    }

    setupUI() {
        // Update welcome message
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName && this.currentUser) {
            welcomeName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        // Update sidebar user info
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userName) {
            userName.textContent = this.currentUser.displayName || 'Student';
        }
        
        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }
    }

    async loadUserProfile() {
        try {
            // Get user profile from database
            this.userProfile = await dbManager.getUserProfile(this.currentUser.uid);
            
            // Populate form fields
            this.populateProfileForm();
            
            // Update profile header
            this.updateProfileHeader();
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            toast.error('Failed to load profile information');
        }
    }

    populateProfileForm() {
        if (!this.userProfile) return;

        // Populate form fields
        const fullName = document.getElementById('full-name');
        const studentId = document.getElementById('student-id');
        const email = document.getElementById('email');
        const session = document.getElementById('session');
        const department = document.getElementById('department');
        const phone = document.getElementById('phone');
        const bio = document.getElementById('bio');
        
        if (fullName) fullName.value = this.userProfile.displayName || '';
        if (studentId) studentId.value = this.userProfile.studentId || '';
        if (email) email.value = this.currentUser.email || '';
        if (session) session.value = this.userProfile.session || '';
        if (department) department.value = this.userProfile.department || '';
        if (phone) phone.value = this.userProfile.phone || '';
        if (bio) bio.value = this.userProfile.bio || '';
    }

    updateProfileHeader() {
        if (!this.userProfile) return;

        // Update profile header display
        const profileDisplayName = document.getElementById('profile-display-name');
        const profileDisplayEmail = document.getElementById('profile-display-email');
        const profileDisplayRole = document.getElementById('profile-display-role');
        
        if (profileDisplayName) {
            profileDisplayName.textContent = this.userProfile.displayName || 'Student';
        }
        
        if (profileDisplayEmail) {
            profileDisplayEmail.textContent = this.currentUser.email;
        }
        
        if (profileDisplayRole) {
            profileDisplayRole.textContent = this.userProfile.role || 'Student';
        }
    }

    async saveProfile() {
        try {
            // Get form values
            const formData = this.getFormData();
            
            // Validate form
            if (!this.validateForm(formData)) {
                return;
            }
            
            // Show loading state
            const saveBtn = document.getElementById('save-profile-btn');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `
                    <svg class="w-4 h-4 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                    </svg>
                    Saving...
                `;
            }
            
            // Update user profile in database
            await dbManager.updateUserProfile(this.currentUser.uid, formData);
            
            // Update local user object
            this.userProfile = { ...this.userProfile, ...formData };
            
            // Update profile header
            this.updateProfileHeader();
            
            // Update sidebar user info
            this.updateUserInfo();
            
            // Show success message
            toast.success('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile. Please try again.');
        } finally {
            // Reset save button
            const saveBtn = document.getElementById('save-profile-btn');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Save Changes
                `;
            }
        }
    }

    getFormData() {
        return {
            displayName: document.getElementById('full-name').value.trim(),
            studentId: document.getElementById('student-id').value.trim(),
            session: document.getElementById('session').value,
            department: document.getElementById('department').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            role: 'student'
        };
    }

    validateForm(formData) {
        if (!formData.displayName) {
            toast.error('Full name is required');
            return false;
        }
        
        if (!formData.studentId) {
            toast.error('Student ID is required');
            return false;
        }
        
        if (!formData.session) {
            toast.error('Academic session is required');
            return false;
        }
        
        return true;
    }

    setupEventListeners() {
        // Save profile button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => uiManager.toggleTheme());
        }
        
        // Form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
    }

    async handleLogout() {
        try {
            await authManager.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed. Please try again.');
        }
    }
}

// Initialize the page
const profilePage = new ProfilePage();
