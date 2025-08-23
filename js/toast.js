// Toast notification system
class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    this.createContainer();
    this.setupStyles();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
    document.body.appendChild(this.container);
  }

  setupStyles() {
    // Add custom styles for toast animations
    const style = document.createElement('style');
    style.textContent = `
      .toast-enter {
        opacity: 0;
        transform: translateX(100%);
      }
      .toast-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: all 300ms ease-out;
      }
      .toast-exit {
        opacity: 1;
        transform: translateX(0);
      }
      .toast-exit-active {
        opacity: 0;
        transform: translateX(100%);
        transition: all 300ms ease-in;
      }
    `;
    document.head.appendChild(style);
  }

  // Show success toast
  success(message, duration = 5000) {
    this.show(message, 'success', duration);
  }

  // Show error toast
  error(message, duration = 7000) {
    this.show(message, 'error', duration);
  }

  // Show info toast
  info(message, duration = 4000) {
    this.show(message, 'info', duration);
  }

  // Show warning toast
  warning(message, duration = 6000) {
    this.show(message, 'warning', duration);
  }

  // Main show method
  show(message, type = 'info', duration = 5000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);

    // Add enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-enter-active');
    });

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }

    // Store reference
    this.toasts.push(toast);

    return toast;
  }

  // Create toast element
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast-enter card p-4 max-w-sm shadow-brand`;
    
    const icon = this.getIcon(type);
    const colors = this.getColors(type);
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium ${colors.text}">${message}</p>
        </div>
        <div class="flex-shrink-0">
          <button class="toast-close text-brand-muted hover:text-brand-text transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));

    return toast;
  }

  // Get icon based on toast type
  getIcon(type) {
    const icons = {
      success: `
        <svg class="w-5 h-5 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
      `,
      error: `
        <svg class="w-5 h-5 text-brand-danger" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
      `,
      warning: `
        <svg class="w-5 h-5 text-brand-warning" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
      `,
      info: `
        <svg class="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
      `
    };

    return icons[type] || icons.info;
  }

  // Get colors based on toast type
  getColors(type) {
    const colors = {
      success: { text: 'text-brand-success' },
      error: { text: 'text-brand-danger' },
      warning: { text: 'text-brand-warning' },
      info: { text: 'text-brand-accent' }
    };

    return colors[type] || colors.info;
  }

  // Remove toast with animation
  removeToast(toast) {
    if (!toast || !toast.parentNode) return;

    // Add exit animation
    toast.classList.remove('toast-enter-active');
    toast.classList.add('toast-exit');
    
    requestAnimationFrame(() => {
      toast.classList.add('toast-exit-active');
    });

    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  // Remove all toasts
  clearAll() {
    this.toasts.forEach(toast => this.removeToast(toast));
  }

  // Remove toasts by type
  clearByType(type) {
    this.toasts.forEach(toast => {
      if (toast.querySelector(`.text-brand-${type}`)) {
        this.removeToast(toast);
      }
    });
  }

  // Get toast count
  getCount() {
    return this.toasts.length;
  }

  // Check if toasts exist
  hasToasts() {
    return this.toasts.length > 0;
  }

  // Show confirmation dialog
  async confirm(message) {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'card max-w-md w-full p-6';
      
      modal.innerHTML = `
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-warning/20 to-brand-warning/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-brand-warning" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-brand-text mb-2">Confirm Action</h3>
          <p class="text-brand-muted mb-6">${message}</p>
          <div class="flex space-x-3">
            <button id="confirm-cancel" class="btn btn-ghost flex-1">Cancel</button>
            <button id="confirm-ok" class="btn btn-danger flex-1">Confirm</button>
          </div>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Add event listeners
      const cancelBtn = modal.querySelector('#confirm-cancel');
      const okBtn = modal.querySelector('#confirm-ok');
      
      const cleanup = () => {
        document.body.removeChild(overlay);
      };
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      okBtn.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(false);
        }
      });
      
      // Close on escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  }
}

// Create and export singleton instance
export const toastManager = new ToastManager();

// Export individual functions for convenience
export const {
  success,
  error,
  info,
  warning,
  show,
  confirm,
  clearAll,
  clearByType,
  getCount,
  hasToasts
} = toastManager;

// Export the manager instance for advanced usage
export default toastManager;
