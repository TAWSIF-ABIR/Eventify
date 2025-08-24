// Events page functionality
import { authManager } from '../auth.js';
import { getEvents } from '../db.js';
import { showSkeleton, showEmptyState, setupPagination } from '../ui.js';
import { success, error } from '../toast.js';

class EventsPage {
  constructor() {
    this.eventsGrid = document.getElementById('events-grid');
    this.searchInput = document.getElementById('search');
    this.categorySelect = document.getElementById('category');
    this.dateFilterSelect = document.getElementById('date-filter');
    this.paginationContainer = document.getElementById('pagination');
    
    this.currentPage = 1;
    this.eventsPerPage = 12;
    this.allEvents = [];
    this.filteredEvents = [];
    this.currentFilters = {};
    
    this.init();
  }

  init() {
    this.loadEvents();
    this.setupEventListeners();
    this.setupSearch();
  }

  // Load all events from database
  async loadEvents() {
    if (!this.eventsGrid) return;

    // Show skeleton loading
    showSkeleton(this.eventsGrid, 6);

    try {
      const result = await getEvents();
      
      if (result.success) {
        this.allEvents = result.events;
        this.filteredEvents = [...this.allEvents];
        this.renderEvents();
        this.updateResultsCount();
      } else {
        showEmptyState(
          this.eventsGrid, 
          'Unable to load events', 
          'Try refreshing the page'
        );
      }
    } catch (err) {
      console.error('Error loading events:', err);
      showEmptyState(
        this.eventsGrid, 
        'An error occurred while loading events', 
        'Try refreshing the page'
      );
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Category filter
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Date filter
    if (this.dateFilterSelect) {
      this.dateFilterSelect.addEventListener('change', () => {
        this.applyFilters();
      });
    }
  }

  // Setup search functionality
  setupSearch() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.currentFilters.search = e.target.value.trim();
        this.applyFilters();
      });
    }
  }

  // Apply all filters
  applyFilters() {
    this.currentFilters.category = this.categorySelect?.value || '';
    this.currentFilters.dateFilter = this.dateFilterSelect?.value || '';
    
    this.filteredEvents = this.allEvents.filter(event => {
      return this.matchesFilters(event);
    });

    this.currentPage = 1;
    this.renderEvents();
    this.updateResultsCount();
    this.renderPagination();
  }

  // Check if event matches current filters
  matchesFilters(event) {
    // Search filter
    if (this.currentFilters.search) {
      const searchTerm = this.currentFilters.search.toLowerCase();
      const searchableText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Category filter
    if (this.currentFilters.category && event.category !== this.currentFilters.category) {
      return false;
    }

    // Date filter
    if (this.currentFilters.dateFilter) {
      const now = new Date();
      const eventDate = new Date(event.startAt.seconds * 1000);
      
      switch (this.currentFilters.dateFilter) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          if (eventDate < today || eventDate >= tomorrow) return false;
          break;
        case 'tomorrow':
          const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          const dayAfterTomorrow = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);
          if (eventDate < tomorrowStart || eventDate >= dayAfterTomorrow) return false;
          break;
        case 'this-week':
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (eventDate < weekStart || eventDate >= weekEnd) return false;
          break;
        case 'this-month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          if (eventDate < monthStart || eventDate >= monthEnd) return false;
          break;
      }
    }

    return true;
  }

  // Render events based on current page and filters
  renderEvents() {
    if (!this.eventsGrid) return;

    const startIndex = (this.currentPage - 1) * this.eventsPerPage;
    const endIndex = startIndex + this.eventsPerPage;
    const eventsToShow = this.filteredEvents.slice(startIndex, endIndex);

    if (eventsToShow.length === 0) {
      if (this.filteredEvents.length === 0) {
        showEmptyState(
          this.eventsGrid, 
          'No events found', 
          'Try adjusting your filters or check back later'
        );
      } else {
        showEmptyState(
          this.eventsGrid, 
          'No events on this page', 
          'Go to the previous page or adjust your filters'
        );
      }
      return;
    }

    this.eventsGrid.innerHTML = eventsToShow.map(event => this.createEventCard(event)).join('');
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

  // Update results count display
  updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      resultsCount.textContent = this.filteredEvents.length;
    }
  }

  // Render pagination
  renderPagination() {
    if (!this.paginationContainer) return;

    const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
    
    if (totalPages <= 1) {
      this.paginationContainer.innerHTML = '';
      return;
    }

    setupPagination(
      this.paginationContainer,
      this.currentPage,
      totalPages,
      (page) => this.goToPage(page)
    );
  }

  // Navigate to specific page
  goToPage(page) {
    this.currentPage = page;
    this.renderEvents();
    this.renderPagination();
    
    // Scroll to top of events grid
    if (this.eventsGrid) {
      this.eventsGrid.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EventsPage();
});

// Export for potential external use
export default EventsPage;
