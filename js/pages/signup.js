// Signup page functionality
import { authManager } from '../auth.js';
import { setLoadingState } from '../ui.js';
import { success, error } from '../toast.js';

class SignupPage {
  constructor() {
    this.form = document.getElementById('signup-form');
    this.fullNameInput = document.getElementById('fullName');
    this.emailInput = document.getElementById('email');
    this.studentIdInput = document.getElementById('studentId');
    this.sessionSelect = document.getElementById('session');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.termsCheckbox = document.getElementById('terms');
    this.submitBtn = document.getElementById('submit-btn');
    
    this.init();
  }

  init() {
    this.setupFormValidation();
    this.setupEventListeners();
    this.checkAuthState();
  }

  // Check if user is already authenticated
  checkAuthState() {
    if (authManager.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  // Setup form validation
  setupFormValidation() {
    const validationRules = {
      fullName: {
        required: true,
        minLength: 2
      },
      email: {
        required: true,
        email: true
      },
      studentId: {
        required: true,
        minLength: 3
      },
      session: {
        required: true
      },
      password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
        patternMessage: 'Password must contain at least 1 letter and 1 number'
      },
      confirmPassword: {
        required: true
      },
      terms: {
        required: true
      }
    };

    // Setup validation on blur
    this.fullNameInput.addEventListener('blur', () => {
      this.validateField(this.fullNameInput, validationRules.fullName);
    });

    this.emailInput.addEventListener('blur', () => {
      this.validateField(this.emailInput, validationRules.email);
    });

    this.studentIdInput.addEventListener('blur', () => {
      this.validateField(this.studentIdInput, validationRules.studentId);
    });

    this.sessionSelect.addEventListener('blur', () => {
      this.validateField(this.sessionSelect, validationRules.session);
    });

    this.passwordInput.addEventListener('blur', () => {
      this.validateField(this.passwordInput, validationRules.password);
      this.validatePasswordMatch();
    });

    this.confirmPasswordInput.addEventListener('blur', () => {
      this.validateField(this.confirmPasswordInput, validationRules.confirmPassword);
      this.validatePasswordMatch();
    });

    // Clear errors on input
    this.fullNameInput.addEventListener('input', () => {
      this.clearFieldError(this.fullNameInput);
    });

    this.emailInput.addEventListener('input', () => {
      this.clearFieldError(this.emailInput);
    });

    this.studentIdInput.addEventListener('input', () => {
      this.clearFieldError(this.studentIdInput);
    });

    this.sessionSelect.addEventListener('change', () => {
      this.clearFieldError(this.sessionSelect);
    });

    this.passwordInput.addEventListener('input', () => {
      this.clearFieldError(this.passwordInput);
      this.clearFieldError(this.confirmPasswordInput);
    });

    this.confirmPasswordInput.addEventListener('input', () => {
      this.clearFieldError(this.confirmPasswordInput);
    });

    this.termsCheckbox.addEventListener('change', () => {
      this.clearFieldError(this.termsCheckbox);
    });
  }

  // Setup event listeners
  setupEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });
  }

  // Validate individual field
  validateField(field, rules) {
    if (!rules) return true;

    const value = field.type === 'checkbox' ? field.checked : field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (rules.email && value && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum length is ${rules.minLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.patternMessage || 'Invalid format';
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  // Validate password match
  validatePasswordMatch() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;

    if (password && confirmPassword && password !== confirmPassword) {
      this.showFieldError(this.confirmPasswordInput, 'Passwords do not match');
      return false;
    }

    return true;
  }

  // Validate entire form
  validateForm() {
    const validationRules = {
      fullName: { required: true, minLength: 2 },
      email: { required: true, email: true },
      studentId: { required: true, minLength: 3 },
      session: { required: true },
      password: { 
        required: true, 
        minLength: 8, 
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
        patternMessage: 'Password must contain at least 1 letter and 1 number'
      },
      confirmPassword: { required: true },
      terms: { required: true }
    };

    const isFullNameValid = this.validateField(this.fullNameInput, validationRules.fullName);
    const isEmailValid = this.validateField(this.emailInput, validationRules.email);
    const isStudentIdValid = this.validateField(this.studentIdInput, validationRules.studentId);
    const isSessionValid = this.validateField(this.sessionSelect, validationRules.session);
    const isPasswordValid = this.validateField(this.passwordInput, validationRules.password);
    const isConfirmPasswordValid = this.validateField(this.confirmPasswordInput, validationRules.confirmPassword);
    const isTermsValid = this.validateField(this.termsCheckbox, validationRules.terms);
    const isPasswordMatchValid = this.validatePasswordMatch();

    return isFullNameValid && isEmailValid && isStudentIdValid && isSessionValid && isPasswordValid && 
           isConfirmPasswordValid && isTermsValid && isPasswordMatchValid;
  }

  // Show field error
  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-brand-danger text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.setAttribute('data-error', 'true');
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('border-brand-danger');
  }

  // Clear field error
  clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('[data-error="true"]');
    if (errorDiv) {
      errorDiv.remove();
    }
    field.classList.remove('border-brand-danger');
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check password strength
  checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('At least 1 lowercase letter');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('At least 1 uppercase letter');

    if (/\d/.test(password)) strength++;
    else feedback.push('At least 1 number');

    if (/[@$!%*#?&]/.test(password)) strength++;
    else feedback.push('At least 1 special character (@$!%*#?&)');

    return { strength, feedback };
  }

  // Handle signup form submission
  async handleSignup() {
    if (!this.validateForm()) {
      return;
    }

    const fullName = this.fullNameInput.value.trim();
    const email = this.emailInput.value.trim();
    const studentId = this.studentIdInput.value.trim();
    const session = this.sessionSelect.value;
    const role = 'student'; // Only students can create accounts
    const password = this.passwordInput.value;
    const terms = this.termsCheckbox.checked;

    // Check password strength
    const passwordStrength = this.checkPasswordStrength(password);
    if (passwordStrength.strength < 3) {
      error('Password is too weak. Please make it stronger.');
      return;
    }

    // Set loading state
    setLoadingState(this.submitBtn, true);

    try {
      const result = await authManager.signUp(email, password, fullName, role, studentId, session);
      
      if (result.success) {
        success('Account created successfully! Redirecting...');
        
        // Redirect based on user role
        setTimeout(() => {
          this.redirectBasedOnRole();
        }, 1500);
      } else {
        error(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      error('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingState(this.submitBtn, false);
    }
  }

  // Redirect user based on their role
  redirectBasedOnRole() {
    // Only students can sign up, so always redirect to student dashboard
    window.location.href = 'dashboard.html';
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SignupPage();
});

// Export for potential external use
export default SignupPage;
