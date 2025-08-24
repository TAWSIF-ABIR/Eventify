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
            console.log('ProfilePage initialization started...');
            
            // Check authentication
            await this.checkAuth();
            
            // Setup UI
            this.setupUI();
            
            // Test database connection
            console.log('Testing database connection...');
            try {
                const testResult = await dbManager.getUserProfile(this.currentUser.uid);
                console.log('Database test result:', testResult);
            } catch (dbError) {
                console.error('Database connection test failed:', dbError);
            }
            
            // Load user profile
            await this.loadUserProfile();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('ProfilePage initialization completed successfully');
            
        } catch (error) {
            console.error('Error initializing ProfilePage:', error);
            toast.error('Failed to initialize page');
        }
    }

    async checkAuth() {
        try {
            console.log('Checking authentication...');
            this.currentUser = await authManager.getCurrentUser();
            console.log('Current user from authManager:', this.currentUser);
            
            if (!this.currentUser) {
                console.log('No current user, redirecting to auth-new.html');
                window.location.href = 'auth-new.html';
                return;
            }
            
            // Update user info in sidebar
            this.updateUserInfo();
            
            console.log('Authentication successful for user:', this.currentUser.uid);
            
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'auth-new.html';
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
            console.log('Loading user profile for UID:', this.currentUser.uid);
            
            // Test dbManager connection
            console.log('Testing dbManager connection...');
            console.log('dbManager object:', dbManager);
            
            // Get user profile from database
            this.userProfile = await dbManager.getUserProfile(this.currentUser.uid);
            console.log('Profile data received:', this.userProfile);
            
            // If no profile exists, create a basic one with current user data
            if (!this.userProfile) {
                console.log('No user profile found, creating basic profile...');
                this.userProfile = {
                    uid: this.currentUser.uid,
                    displayName: this.currentUser.displayName || this.currentUser.email.split('@')[0],
                    email: this.currentUser.email,
                    role: 'student',
                    studentId: '',
                    session: '',
                    department: '',
                    phone: '',
                    bio: '',
                    profileComplete: false
                };
                
                // Save the basic profile to database
                try {
                    const result = await dbManager.createUserProfile(this.currentUser.uid, this.userProfile);
                    console.log('Basic profile creation result:', result);
                    if (result.success) {
                        console.log('Basic profile created successfully');
                    } else {
                        console.error('Failed to create basic profile:', result.error);
                    }
                } catch (createError) {
                    console.error('Failed to create basic profile:', createError);
                }
            } else {
                console.log('Existing profile found, using it:', this.userProfile);
            }
            
            // Populate form fields
            console.log('About to populate form fields...');
            this.populateProfileForm();
            console.log('Form fields populated');
            
            // Update profile header
            console.log('About to update profile header...');
            this.updateProfileHeader();
            console.log('Profile header updated');
            
            console.log('User profile loaded successfully:', this.userProfile);
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            toast.error('Failed to load profile information');
        }
    }

    populateProfileForm() {
        if (!this.userProfile) {
            console.log('No user profile to populate form with');
            return;
        }

        console.log('Starting to populate form fields...');
        
        // Populate form fields with all user data
        const fullName = document.getElementById('full-name');
        const studentId = document.getElementById('student-id');
        const email = document.getElementById('email');
        const session = document.getElementById('session');
        const department = document.getElementById('department');
        const phone = document.getElementById('phone');
        const bio = document.getElementById('bio');
        
        console.log('Form elements found:', {
            fullName: !!fullName,
            studentId: !!studentId,
            email: !!email,
            session: !!session,
            department: !!department,
            phone: !!phone,
            bio: !!bio
        });
        
        if (fullName) {
            fullName.value = this.userProfile.displayName || '';
            console.log('Set fullName to:', fullName.value);
        }
        if (studentId) {
            studentId.value = this.userProfile.studentId || '';
            console.log('Set studentId to:', studentId.value);
        }
        if (email) {
            email.value = this.currentUser.email || '';
            console.log('Set email to:', email.value);
        }
        if (session) {
            session.value = this.userProfile.session || '';
            console.log('Set session to:', session.value);
        }
        if (department) {
            department.value = this.userProfile.department || '';
            console.log('Set department to:', department.value);
        }
        if (phone) {
            phone.value = this.userProfile.phone || '';
            console.log('Set phone to:', phone.value);
        }
        if (bio) {
            bio.value = this.userProfile.bio || '';
            console.log('Set bio to:', bio.value);
        }
        
        // Log the data being populated for debugging
        console.log('Form populated successfully with profile data:', this.userProfile);
    }

    updateProfileHeader() {
        if (!this.userProfile) return;

        // Update profile header display with all user information
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
        
        // Log the profile header update for debugging
        console.log('Updated profile header with:', {
            displayName: this.userProfile.displayName,
            email: this.currentUser.email,
            role: this.userProfile.role
        });
    }

    async saveProfile() {
        try {
            console.log('Save profile function called');
            
            // Get form values
            const formData = this.getFormData();
            console.log('Form data collected:', formData);
            
            // Validate form
            if (!this.validateForm(formData)) {
                console.log('Form validation failed');
                return;
            }
            
            console.log('Form validation passed, proceeding to save...');
            
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
            
            console.log('Saving profile data:', formData);
            
            // Build certificateProfile from form fields
            const certificateProfile = {
                name: formData.displayName || null,
                studentId: formData.studentId || null,
                session: formData.session || null,
                department: formData.department || null
            };

            // Update user profile in database (merge keeps other fields)
            const result = await dbManager.updateUserProfile(this.currentUser.uid, {
                ...formData,
                certificateProfile
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to update profile');
            }
            
            // Also update Firebase Auth displayName so it's used across the app
            try {
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(this.currentUser, { displayName: formData.displayName });
                // refresh local auth user reference
                this.currentUser.displayName = formData.displayName;
            } catch (authUpdateErr) {
                console.warn('Failed to update auth displayName:', authUpdateErr);
            }

            // Update local user object
            this.userProfile = { ...this.userProfile, ...formData, certificateProfile };
            // Mirror onto currentUser used globally
            try {
                window.currentUser = window.currentUser || {};
                window.currentUser.displayName = formData.displayName;
                window.currentUser.studentId = formData.studentId;
                window.currentUser.session = formData.session;
                window.currentUser.certificateProfile = certificateProfile;
            } catch (_) {}
            
            // Update profile header
            this.updateProfileHeader();
            
            // Update sidebar user info
            this.updateUserInfo();
            
            // Update profile completion status
            this.showProfileCompletionStatus();
            
            // Show success message
            toast.success('Profile updated successfully!');
            
            console.log('Profile saved successfully:', this.userProfile);
            
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
        const fullName = document.getElementById('full-name');
        const studentId = document.getElementById('student-id');
        const session = document.getElementById('session');
        const department = document.getElementById('department');
        const phone = document.getElementById('phone');
        const bio = document.getElementById('bio');
        
        console.log('Form elements found:', {
            fullName: fullName ? fullName.value : 'NOT FOUND',
            studentId: studentId ? studentId.value : 'NOT FOUND',
            session: session ? session.value : 'NOT FOUND',
            department: department ? department.value : 'NOT FOUND',
            phone: phone ? phone.value : 'NOT FOUND',
            bio: bio ? bio.value : 'NOT FOUND'
        });
        
        return {
            displayName: fullName ? fullName.value.trim() : '',
            studentId: studentId ? studentId.value.trim() : '',
            session: session ? session.value : '',
            department: department ? department.value.trim() : '',
            phone: phone ? phone.value.trim() : '',
            bio: bio ? bio.value.trim() : '',
            role: 'student',
            updatedAt: new Date()
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
        
        // Additional validation for phone number format
        if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        
        return true;
    }

    setupEventListeners() {
        // Save profile button
        const saveBtn = document.getElementById('save-profile-btn');
        console.log('Save button found:', !!saveBtn);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('Save button clicked!');
                this.saveProfile();
            });
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
        console.log('Profile form found:', !!profileForm);
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                console.log('Form submitted!');
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Add profile completion indicator
        this.showProfileCompletionStatus();
    }
    
    showProfileCompletionStatus() {
        if (!this.userProfile) return;
        
        const requiredFields = ['displayName', 'studentId', 'session', 'phone'];
        const completedFields = requiredFields.filter(field => this.userProfile[field] && this.userProfile[field].trim() !== '');
        const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
        
        // Show completion status in the UI
        const profileHeader = document.querySelector('.card.p-8.mb-8');
        if (profileHeader && completionPercentage < 100) {
            const existingStatus = profileHeader.querySelector('.profile-completion-status');
            if (!existingStatus) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'profile-completion-status mt-4 p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-lg';
                statusDiv.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-brand-warning" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-sm text-brand-warning">
                            Profile ${completionPercentage}% complete. Please fill in all required fields.
                        </span>
                    </div>
                `;
                profileHeader.appendChild(statusDiv);
            }
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
