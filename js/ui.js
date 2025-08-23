// UI utilities and common functions
import { authManager } from './auth.js';

class UIManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupMobileMenu();
  }

  // Theme management
  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme();
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  // Navigation setup
  setupNavigation() {
    this.updateNavigationState();
    authManager.onAuthStateChange(() => this.updateNavigationState());
  }

  updateNavigationState() {
    const isAuthenticated = authManager.isAuthenticated();
    const userRole = authManager.getUserRole();
    
    // Update navigation items visibility
    const authItems = document.querySelectorAll('[data-auth="required"]');
    const studentItems = document.querySelectorAll('[data-auth="student"]');
    const adminItems = document.querySelectorAll('[data-auth="admin"]');
    const guestItems = document.querySelectorAll('[data-auth="guest"]');

    authItems.forEach(item => {
      item.style.display = isAuthenticated ? 'block' : 'none';
    });

    studentItems.forEach(item => {
      item.style.display = (isAuthenticated && userRole === 'Student') ? 'block' : 'none';
    });

    adminItems.forEach(item => {
      item.style.display = (isAuthenticated && userRole === 'Admin') ? 'block' : 'none';
    });

    guestItems.forEach(item => {
      item.style.display = !isAuthenticated ? 'block' : 'none';
    });

    // Update user menu
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (userMenu && userAvatar && userName) {
      if (isAuthenticated) {
        const user = authManager.getCurrentUser();
        userName.textContent = user.displayName || user.email;
        userAvatar.style.display = 'block';
        userMenu.style.display = 'block';
      } else {
        userAvatar.style.display = 'none';
        userMenu.style.display = 'none';
      }
    }
  }

  // Mobile menu setup
  setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  }

  // Form handling
  setupFormValidation(formSelector, validationRules) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    const submitButton = form.querySelector('button[type="submit"]');

    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input, validationRules[input.name]));
      input.addEventListener('input', () => this.clearFieldError(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm(form, validationRules)) {
        this.handleFormSubmit(form);
      }
    });
  }

  validateField(field, rules) {
    if (!rules) return true;

    const value = field.value.trim();
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
    if (rules.minLength && value.length < rules.minLength) {
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

  validateForm(form, validationRules) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input, validationRules[input.name])) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-brand-danger text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.setAttribute('data-error', 'true');
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('border-brand-danger');
  }

  clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('[data-error="true"]');
    if (errorDiv) {
      errorDiv.remove();
    }
    field.classList.remove('border-brand-danger');
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Loading states
  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      `;
    } else {
      button.disabled = false;
      button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
    }
  }

  // Skeleton loading
  showSkeleton(container, count = 3) {
    const skeletonHTML = `
      <div class="card animate-pulse">
        <div class="h-48 bg-brand-muted/20 rounded-t-2xl"></div>
        <div class="p-6">
          <div class="h-4 bg-brand-muted/20 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-brand-muted/20 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-brand-muted/20 rounded w-2/3"></div>
        </div>
      </div>
    `;

    container.innerHTML = skeletonHTML.repeat(count);
  }

  // Empty state
  showEmptyState(container, message, actionText = null, actionCallback = null) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 text-brand-muted">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-brand-text mb-2">${message}</h3>
        ${actionText && actionCallback ? `
          <button class="btn btn-primary mt-4" onclick="${actionCallback}">
            ${actionText}
          </button>
        ` : ''}
      </div>
    `;
  }

  // Modal management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus trap
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Date formatting
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  }

  formatRelativeTime(date) {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInMs = eventDate - now;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return 'Past';
    } else if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Tomorrow';
    } else if (diffInDays < 7) {
      return `In ${diffInDays} days`;
    } else {
      return this.formatDate(date, { month: 'short', day: 'numeric' });
    }
  }

  // Search and filtering
  setupSearch(inputSelector, itemsSelector, searchFields = ['title', 'description']) {
    const searchInput = document.querySelector(inputSelector);
    const items = document.querySelectorAll(itemsSelector);

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();

      items.forEach(item => {
        const text = searchFields
          .map(field => item.getAttribute(`data-${field}`) || '')
          .join(' ')
          .toLowerCase();

        if (text.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Pagination
  setupPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return;

    const paginationHTML = this.generatePaginationHTML(currentPage, totalPages);
    container.innerHTML = paginationHTML;

    // Add event listeners
    const pageButtons = container.querySelectorAll('[data-page]');
    pageButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(button.getAttribute('data-page'));
        onPageChange(page);
      });
    });
  }

  generatePaginationHTML(currentPage, totalPages) {
    let html = '<nav class="flex items-center justify-center space-x-2">';
    
    // Previous button
    if (currentPage > 1) {
      html += `<button data-page="${currentPage - 1}" class="btn btn-ghost">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        html += `<button class="btn btn-primary">${i}</button>`;
      } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        html += `<button data-page="${i}" class="btn btn-ghost">${i}</button>`;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        html += '<span class="px-3 py-2 text-brand-muted">...</span>';
      }
    }

    // Next button
    if (currentPage < totalPages) {
      html += `<button data-page="${currentPage + 1}" class="btn btn-ghost">Next</button>`;
    }

    html += '</nav>';
    return html;
  }
}

// Create and export singleton instance
export const uiManager = new UIManager();

// Export individual functions for convenience
export const {
  toggleTheme,
  setupFormValidation,
  setLoadingState,
  showSkeleton,
  showEmptyState,
  showModal,
  hideModal,
  formatDate,
  formatRelativeTime,
  setupSearch,
  setupPagination
} = uiManager;
