// Index page functionality
import { authManager } from '../auth.js';
import { getUpcomingEvents } from '../db.js';
import { showSkeleton, showEmptyState } from '../ui.js';
import { success, error } from '../toast.js';

class IndexPage {
  constructor() {
    this.eventsGrid = document.getElementById('events-grid');
    this.logoutBtn = document.getElementById('logout-btn');
    this.mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    this.init();
  }

  init() {
    this.loadFeaturedEvents();
    this.setupEventListeners();
    this.setupUserMenu();
  }

  // Load featured events
  async loadFeaturedEvents() {
    if (!this.eventsGrid) return;

    // Show skeleton loading
    showSkeleton(this.eventsGrid, 6);

    try {
      const result = await getUpcomingEvents(6);
      
      if (result.success && result.events.length > 0) {
        this.renderEvents(result.events);
      } else {
        showEmptyState(
          this.eventsGrid, 
          'No upcoming events at the moment', 
          'Check back later for new events'
        );
      }
    } catch (err) {
      console.error('Error loading events:', err);
      showEmptyState(
        this.eventsGrid, 
        'Unable to load events', 
        'Try refreshing the page'
      );
    }
  }

  // Render events in the grid
  renderEvents(events) {
    if (!this.eventsGrid) return;

    this.eventsGrid.innerHTML = events.map(event => this.createEventCard(event)).join('');
  }

  // Create event card HTML
  createEventCard(event) {
    const startDate = new Date(event.startAt.seconds * 1000);
    const endDate = new Date(event.endAt.seconds * 1000);
    const deadline = event.deadline ? new Date(event.deadline.seconds * 1000) : null;
    
    const isRegistrationOpen = !deadline || new Date() < deadline;
    const isCapacityReached = event.capacity && event.attendeeCount >= event.capacity;
    const canRegister = isRegistrationOpen && !isCapacityReached;

    return `
      <div class="card group hover:scale-105 transition-all duration-300 cursor-pointer" 
           onclick="window.location.href='event.html?id=${event.id}'; window.trackEventView('${event.id}')">
        <!-- Event Image -->
        <div class="relative h-48 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-t-2xl overflow-hidden">
          ${event.imageUrl ? 
            `<img src="${event.imageUrl}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">` :
            `<div class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-brand-muted" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
              </svg>
            </div>`
          }
          
          <!-- Category Badge -->
          <div class="absolute top-3 left-3">
            <span class="px-3 py-1 bg-brand-primary/90 text-white text-xs font-medium rounded-full">
              ${event.category}
            </span>
          </div>

          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            ${!canRegister ? 
              `<span class="px-3 py-1 bg-brand-danger/90 text-white text-xs font-medium rounded-full">
                ${isCapacityReached ? 'Full' : 'Closed'}
              </span>` :
              `<span class="px-3 py-1 bg-brand-success/90 text-white text-xs font-medium rounded-full">
                Open
              </span>`
            }
          </div>
        </div>

        <!-- Event Details -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-brand-text mb-2 line-clamp-2">
            ${event.title}
          </h3>
          
          <p class="text-brand-muted text-sm mb-4 line-clamp-2">
            ${event.description}
          </p>

          <!-- Event Meta -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-brand-muted">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              ${startDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            
            <div class="flex items-center text-sm text-brand-muted">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              ${event.location}
            </div>

            ${event.capacity ? `
              <div class="flex items-center text-sm text-brand-muted">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                ${event.attendeeCount || 0} / ${event.capacity} attendees
              </div>
            ` : ''}
          </div>

          <!-- Action Button -->
          <div class="flex justify-between items-center">
            <a href="event.html?id=${event.id}" 
               class="btn btn-primary text-sm px-4 py-2">
              View Details
            </a>
            
            ${event.capacity ? `
              <span class="text-xs text-brand-muted">
                ${Math.round(((event.attendeeCount || 0) / event.capacity) * 100)}% full
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // Logout functionality
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    if (this.mobileLogoutBtn) {
      this.mobileLogoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  // Setup user menu interactions
  setupUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;

    const userButton = userMenu.querySelector('button');
    const dropdown = userMenu.querySelector('.absolute');

    if (userButton && dropdown) {
      // Toggle dropdown on click
      userButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('opacity-0');
        dropdown.classList.toggle('invisible');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
          dropdown.classList.add('opacity-0', 'invisible');
        }
      });
    }
  }

  // Handle logout
  async handleLogout() {
    try {
      const result = await authManager.signOut();
      if (result.success) {
        success('Logged out successfully');
        window.location.href = '/';
      } else {
        error('Logout failed. Please try again.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      error('An error occurred during logout');
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new IndexPage();
});

// Export for potential external use
export default IndexPage;
