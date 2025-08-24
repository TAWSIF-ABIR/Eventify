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
            
            // Load user profile from Firebase
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
        const userAvatar = document.getElementById('user-avatar');
        
        if (userName) {
            userName.textContent = this.currentUser.displayName || 'Student';
        }
        
        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }

        // Update sidebar avatar
        if (userAvatar) {
            if (this.userProfile?.avatarUrl) {
                userAvatar.innerHTML = `<img src="${this.userProfile.avatarUrl}" alt="Profile" class="w-full h-full rounded-full object-cover">`;
            } else {
                userAvatar.innerHTML = `
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                `;
            }
        }
    }

    async loadUserProfile() {
        try {
            console.log('Loading user profile for UID:', this.currentUser.uid);
            
            // Get user profile from Firebase database
            this.userProfile = await dbManager.getUserProfile(this.currentUser.uid);
            console.log('Profile data received from Firebase:', this.userProfile);
            
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
                    avatarUrl: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
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
            this.populateProfileForm();
            
            // Update profile header
            this.updateProfileHeader();
            
            // Update sidebar user info
            this.updateUserInfo();
            
            // Update additional user data fields
            this.updateUserDataFields();
            
            // Update avatar preview
            this.updateAvatarPreview();
            
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

        console.log('Starting to populate form fields with Firebase data...');
        
        // Populate form fields with all user data from Firebase
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
            email.value = this.userProfile.email || this.currentUser.email || '';
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
        console.log('Form populated successfully with Firebase profile data:', this.userProfile);
    }

    updateProfileHeader() {
        if (!this.userProfile) return;

        // Update profile header display with all user information from Firebase
        const profileDisplayName = document.getElementById('profile-display-name');
        const profileDisplayEmail = document.getElementById('profile-display-email');
        const profileDisplayRole = document.getElementById('profile-display-role');
        
        if (profileDisplayName) {
            profileDisplayName.textContent = this.userProfile.displayName || 'Student';
        }
        
        if (profileDisplayEmail) {
            profileDisplayEmail.textContent = this.userProfile.email || this.currentUser.email;
        }
        
        if (profileDisplayRole) {
            profileDisplayRole.textContent = this.userProfile.role || 'Student';
        }

        // Update profile avatar in header
        const profileAvatar = document.querySelector('.card.p-8.mb-8 .w-24.h-24');
        if (profileAvatar && this.userProfile.avatarUrl) {
            profileAvatar.innerHTML = `<img src="${this.userProfile.avatarUrl}" alt="Profile" class="w-full h-full rounded-3xl object-cover">`;
        } else if (profileAvatar) {
            profileAvatar.innerHTML = `
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
            `;
        }
        
        // Log the profile header update for debugging
        console.log('Updated profile header with Firebase data:', {
            displayName: this.userProfile.displayName,
            email: this.userProfile.email,
            role: this.userProfile.role,
            avatarUrl: this.userProfile.avatarUrl
        });
    }

    updateUserDataFields() {
        if (!this.userProfile) return;

        // Update additional user data fields
        const userUid = document.getElementById('user-uid');
        const userCreated = document.getElementById('user-created');
        const userUpdated = document.getElementById('user-updated');
        const userAvatarStatus = document.getElementById('user-avatar-status');
        
        if (userUid) {
            userUid.textContent = this.userProfile.uid || 'N/A';
        }
        
        if (userCreated) {
            if (this.userProfile.createdAt) {
                const createdDate = this.userProfile.createdAt instanceof Date 
                    ? this.userProfile.createdAt 
                    : this.userProfile.createdAt.toDate ? this.userProfile.createdAt.toDate() 
                    : new Date(this.userProfile.createdAt);
                userCreated.textContent = createdDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                userCreated.textContent = 'N/A';
            }
        }
        
        if (userUpdated) {
            if (this.userProfile.updatedAt) {
                const updatedDate = this.userProfile.updatedAt instanceof Date 
                    ? this.userProfile.updatedAt 
                    : this.userProfile.updatedAt.toDate ? this.userProfile.updatedAt.toDate() 
                    : new Date(this.userProfile.updatedAt);
                userUpdated.textContent = updatedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                userUpdated.textContent = 'N/A';
            }
        }
        
        if (userAvatarStatus) {
            if (this.userProfile.avatarUrl) {
                userAvatarStatus.textContent = 'Avatar uploaded';
                userAvatarStatus.className = 'text-sm text-brand-success';
            } else {
                userAvatarStatus.textContent = 'No avatar';
                userAvatarStatus.className = 'text-sm text-brand-muted';
            }
        }
        
        console.log('Updated user data fields with Firebase data:', {
            uid: this.userProfile.uid,
            createdAt: this.userProfile.createdAt,
            updatedAt: this.userProfile.updatedAt,
            avatarUrl: this.userProfile.avatarUrl
        });
    }

    updateAvatarPreview() {
        if (!this.userProfile) return;

        const profileAvatarPreview = document.getElementById('profile-avatar-preview');
        if (profileAvatarPreview) {
            if (this.userProfile.avatarUrl) {
                profileAvatarPreview.innerHTML = `<img src="${this.userProfile.avatarUrl}" alt="Profile" class="w-full h-full rounded-3xl object-cover">`;
            } else {
                profileAvatarPreview.innerHTML = `
                    <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                `;
            }
        }
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
            
            console.log('Saving profile data to Firebase:', formData);
            
            // Update user profile in Firebase database
            const result = await dbManager.updateUserProfile(this.currentUser.uid, formData);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to update profile');
            }
            
            // Update local user object
            this.userProfile = { ...this.userProfile, ...formData };
            
            // Update profile header
            this.updateProfileHeader();
            
            // Update sidebar user info
            this.updateUserInfo();
            
            // Update profile completion status
            this.showProfileCompletionStatus();
            
            // Show success message
            toast.success('Profile updated successfully!');
            
            console.log('Profile saved successfully to Firebase:', this.userProfile);
            
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
            role: this.userProfile?.role || 'student',
            avatarUrl: this.userProfile?.avatarUrl || null,
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
        
        // Avatar upload
        const avatarUploadBtn = document.getElementById('avatar-upload-btn');
        const avatarUpload = document.getElementById('avatar-upload');
        if (avatarUploadBtn && avatarUpload) {
            avatarUploadBtn.addEventListener('click', () => {
                avatarUpload.click();
            });
            
            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e.target.files[0]);
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

    handleAvatarUpload(file) {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        
        // Create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const profileAvatarPreview = document.getElementById('profile-avatar-preview');
            if (profileAvatarPreview) {
                profileAvatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-full h-full rounded-3xl object-cover">`;
            }
        };
        reader.readAsDataURL(file);
        
        // Store the data URL in the user profile
        // In a real app, you'd upload to Firebase Storage and get a URL
        this.userProfile.avatarUrl = e.target.result;
        
        toast.success('Avatar updated! Click Save Changes to persist the change.');
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
