import { authManager } from '../auth.js';
import { setLoadingState } from '../ui.js';
import { success, error } from '../toast.js';

class LoginPage {
    constructor() {
        this.currentRole = null;
        this.loginForm = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitBtn = document.getElementById('submit-btn');
        this.init();
    }

    init() {
        // Check if already authenticated
        authManager.onAuthStateChange((user) => {
            if (user) {
                // Redirect based on user role
                this.redirectUser(user);
            }
        });

        this.setupEventListeners();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        // Role selection cards
        const studentCard = document.querySelector('[data-role="student"]');
        const adminCard = document.querySelector('[data-role="admin"]');
        
        if (studentCard) {
            // Add multiple event listeners to ensure it works
            studentCard.addEventListener('click', () => {
                this.selectRole('student');
            });
            studentCard.addEventListener('mousedown', () => {
                this.selectRole('student');
            });
            studentCard.addEventListener('touchend', () => {
                this.selectRole('student');
            });
        }
        if (adminCard) {
            // Add multiple event listeners to ensure it works
            adminCard.addEventListener('click', () => {
                this.selectRole('admin');
            });
            adminCard.addEventListener('mousedown', () => {
                this.selectRole('admin');
            });
            adminCard.addEventListener('touchend', () => {
                this.selectRole('admin');
            });
        }

        // Back to role selection
        const backBtn = document.getElementById('back-to-roles');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showRoleSelection());
        }

        // Switch role button
        const switchRoleBtn = document.getElementById('switch-role');
        if (switchRoleBtn) {
            switchRoleBtn.addEventListener('click', () => this.switchRole());
        }

        // Password toggle
        const passwordToggle = document.getElementById('toggle-password');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePassword());
        }

        // Form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    selectRole(role) {
        console.log('Role selected:', role);
        this.currentRole = role;
        this.showLoginForm();
        this.updateFormForRole(role);
    }

    switchRole() {
        const newRole = this.currentRole === 'student' ? 'admin' : 'student';
        this.currentRole = newRole;
        this.updateFormForRole(newRole);
    }

    showRoleSelection() {
        document.getElementById('role-selection').classList.remove('hidden');
        document.getElementById('login-form-section').classList.add('hidden');
        this.currentRole = null;
    }

    showLoginForm() {
        console.log('Showing login form...');
        const roleSelection = document.getElementById('role-selection');
        const loginFormSection = document.getElementById('login-form-section');
        
        if (roleSelection && loginFormSection) {
            roleSelection.classList.add('hidden');
            loginFormSection.classList.remove('hidden');
            console.log('Login form shown successfully');
        } else {
            console.error('Could not find role-selection or login-form-section elements');
        }
    }

    updateFormForRole(role) {
        const roleIndicator = document.getElementById('role-indicator');
        const formTitle = document.getElementById('form-title');
        const loginBtnText = document.getElementById('login-btn-text');
        const switchRoleBtn = document.getElementById('switch-role');
        const adminNote = document.getElementById('admin-note');
        const registerSection = document.getElementById('register-section');

        if (role === 'student') {
            // Update visual indicators
            roleIndicator.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 glow-effect hover:scale-110 transition-transform duration-300';
            roleIndicator.innerHTML = `
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
            `;
            formTitle.textContent = 'Student Login';
            loginBtnText.textContent = 'Login to Student Portal';
            switchRoleBtn.textContent = 'Switch to Admin Login';
            if (adminNote) adminNote.style.display = 'none';
            if (registerSection) registerSection.style.display = 'block';
        } else {
            // Update visual indicators for admin
            roleIndicator.className = 'w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 glow-effect hover:scale-110 transition-transform duration-300';
            roleIndicator.innerHTML = `
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
            `;
            formTitle.textContent = 'Club Admin Login';
            loginBtnText.textContent = 'Login to Admin Dashboard';
            switchRoleBtn.textContent = 'Switch to Student Login';
            if (adminNote) adminNote.style.display = 'block';
            if (registerSection) registerSection.style.display = 'none';
        }
    }

    togglePassword() {
        const passwordInput = this.passwordInput;
        const toggleBtn = document.getElementById('toggle-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = `
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
            `;
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = `
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
            `;
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        // Basic validation
        if (!this.validateForm(email, password)) {
            return;
        }

        try {
            setLoadingState(this.submitBtn, true);
            this.clearErrors();

            const result = await authManager.signIn(email, password);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Verify role matches selection
            const userRole = authManager.getUserRole();
            if (this.currentRole && userRole !== this.currentRole) {
                throw new Error(`This account is registered as ${userRole}, not ${this.currentRole}`);
            }

            success(`Welcome back!`);
            
            // Redirect based on user role
            this.redirectUser(result.user);

        } catch (err) {
            console.error('Login error:', err);
            this.handleLoginError(err);
        } finally {
            setLoadingState(this.submitBtn, false);
        }
    }

    validateForm(email, password) {
        let isValid = true;

        // Email validation
        if (!email) {
            this.showError('email-error', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email-error', 'Please enter a valid email');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showError('password-error', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    handleLoginError(err) {
        let errorMessage = this.getErrorMessage(err.code || err.message);
        error(errorMessage);
        
        // Show specific field errors
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
            this.showError('email-error', 'Invalid email address');
        } else if (err.code === 'auth/wrong-password') {
            this.showError('password-error', 'Incorrect password');
        } else if (err.message && err.message.includes('role')) {
            // Custom role mismatch error
            this.showError('email-error', err.message);
        }
    }

    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            default:
                if (typeof errorCode === 'string' && errorCode.includes('role')) {
                    return errorCode;
                }
                return 'Login failed. Please try again';
        }
    }

    redirectUser(user) {
        const userRole = authManager.getUserRole();
        if (userRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize the login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

export default LoginPage;