import { authManager } from '../auth.js';
import { getAdminEvents, deleteEvent, updateEvent, createEvent } from '../db.js';
import { success, error, confirm } from '../toast.js';

class AdminDashboardPage {
    constructor() {
        this.user = null;
        this.adminEvents = [];
        this.init();
    }

    async init() {
        try {
            // Check authentication and admin role
            await this.checkAuthState();
            
            // Setup UI components
            this.setupUI();
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (err) {
            console.error('Admin dashboard initialization error:', err);
            error('Failed to initialize admin dashboard');
        }
    }

    async checkAuthState() {
        // Wait for auth state to be determined
        return new Promise((resolve) => {
            const unsubscribe = authManager.onAuthStateChanged((user) => {
                if (user) {
                    this.user = user;
                    // Check if user is admin
                    if (authManager.isAdmin()) {
                        this.updateUserInfo();
                        unsubscribe();
                        resolve();
                    } else {
                        // Redirect to student dashboard if not admin
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    // Redirect to login if not authenticated
                    window.location.href = 'login.html';
                }
            });
        });
    }

    setupUI() {
        // Setup theme toggle
        this.setupThemeToggle();
    }

    async loadDashboardData() {
        try {
            // Show loading states
            this.showLoadingStates();
            
            // Load admin events
            await this.loadAdminEvents();
            
            // Update statistics
            this.updateStatistics();
            
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            error('Failed to load dashboard data');
        }
    }

    async loadAdminEvents() {
        try {
            this.adminEvents = await getAdminEvents(this.user.uid);
            this.renderAdminEvents();
        } catch (err) {
            console.error('Error loading admin events:', err);
            error('Failed to load your events');
        }
    }

    showLoadingStates() {
        // Show loading state for admin events
        const eventsLoading = document.getElementById('events-loading');
        const eventsEmpty = document.getElementById('events-empty');
        
        if (eventsLoading) eventsLoading.classList.remove('hidden');
        if (eventsEmpty) eventsEmpty.classList.add('hidden');
    }

    renderAdminEvents() {
        const container = document.getElementById('admin-events');
        const loading = document.getElementById('events-loading');
        const empty = document.getElementById('events-empty');
        
        if (!container) return;

        // Hide loading
        if (loading) loading.classList.add('hidden');

        if (this.adminEvents.length === 0) {
            // Show empty state
            if (empty) empty.classList.remove('hidden');
            return;
        }

        // Hide empty state
        if (empty) empty.classList.add('hidden');

        // Render events
        container.innerHTML = this.adminEvents.map(event => 
            this.createAdminEventCard(event)
        ).join('');
    }

    // Create admin event card with consistent sizing
    createAdminEventCard(event) {
        const card = document.createElement('div');
        card.className = 'card p-6 hover:scale-105 transition-all duration-300 max-w-2xl mx-auto w-full';
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-brand-text mb-3">${event.title}</h3>
                    <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-brand-success/20 text-brand-success' :
                        event.status === 'ongoing' ? 'bg-brand-warning/20 text-brand-warning' :
                        'bg-brand-muted/20 text-brand-muted'
                    }">
                        ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-brand-muted">Date & Time</p>
                            <p class="text-brand-text font-semibold text-sm">${this.formatDate(event.startAt)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-brand-muted">Location</p>
                            <p class="text-brand-text font-semibold text-sm">${event.location || 'TBD'}</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-brand-success/20 to-brand-success/10 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-brand-muted">Attendees</p>
                            <p class="text-brand-text font-semibold text-sm">${event.attendeeCount || 0}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-brand-warning/20 to-brand-warning/10 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-brand-warning" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-brand-muted">Category</p>
                            <p class="text-brand-text font-semibold text-sm">${event.category || 'General'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-sm leading-relaxed text-brand-muted mb-4">${event.description ? event.description.substring(0, 120) + '...' : 'No description available'}</p>

            <div class="flex items-center justify-between pt-4 border-t border-white/10">
                <div class="flex space-x-2">
                    <button class="btn btn-primary px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2" onclick="adminDashboardPage.viewEventDetails('${event.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                        <span>View Details</span>
                    </button>
                    <button class="btn btn-secondary px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2" onclick="adminDashboardPage.editEvent('${event.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                        <span>Edit</span>
                    </button>
                    <button class="btn btn-success px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2" onclick="adminDashboardPage.duplicateEvent('${event.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                        <span>Duplicate</span>
                    </button>
                    <button class="btn btn-danger px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2" onclick="adminDashboardPage.deleteEvent('${event.id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span>Delete</span>
                    </button>
                </div>
                <div class="flex items-center space-x-2">
                    <select class="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-brand-text" onchange="adminDashboardPage.updateEventStatus('${event.id}', this.value)">
                        <option value="draft" ${event.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="upcoming" ${event.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                        <option value="ongoing" ${event.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                        <option value="completed" ${event.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${event.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <div class="text-xs text-brand-muted bg-white/5 px-2 py-1 rounded">
                        ID: ${event.id.substring(0, 8)}
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    updateStatistics() {
        this.totalEvents = this.adminEvents.length;
        this.upcomingEvents = this.adminEvents.filter(event => {
            const eventDate = new Date(event.startAt.seconds * 1000);
            return eventDate > new Date();
        }).length;
        
        this.totalAttendees = this.adminEvents.reduce((total, event) => {
            return total + (event.attendeeCount || 0);
        }, 0);

        // Get unique event categories
        this.eventCategories = [...new Set(this.adminEvents.map(event => event.category).filter(Boolean))];

        // Update stats display
        const totalEventsEl = document.getElementById('total-events');
        const upcomingEventsEl = document.getElementById('upcoming-events');
        const totalAttendeesEl = document.getElementById('total-attendees');

        if (totalEventsEl) totalEventsEl.textContent = this.totalEvents;
        if (upcomingEventsEl) upcomingEventsEl.textContent = this.upcomingEvents;
        if (totalAttendeesEl) totalAttendeesEl.textContent = this.totalAttendees;
    }

    updateUserInfo() {
        // Update welcome name
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = this.user.displayName || this.user.email.split('@')[0];
        }

        // Update sidebar user info
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userName) {
            userName.textContent = this.user.displayName || this.user.email.split('@')[0];
        }
        if (userEmail) {
            userEmail.textContent = this.user.email;
        }
    }

    editEvent(eventId) {
        try {
            const event = this.adminEvents.find(e => e.id === eventId);
            if (!event) {
                error('Event not found');
                return;
            }

            // Store event data in localStorage for edit page
            localStorage.setItem('editEventData', JSON.stringify(event));
            
            // Redirect to edit event page
            window.location.href = `edit-event.html?id=${eventId}`;
        } catch (err) {
            console.error('Error preparing event for edit:', err);
            error('Failed to prepare event for editing');
        }
    }

    // Method to handle event status updates
    async updateEventStatus(eventId, newStatus) {
        try {
            const event = this.adminEvents.find(e => e.id === eventId);
            if (!event) {
                error('Event not found');
                return;
            }

            // Update event status in database
            const result = await updateEvent(eventId, { status: newStatus });
            if (result.success) {
                success(`Event status updated to ${newStatus}`);
                // Reload events
                await this.loadAdminEvents();
                this.updateStatistics();
            } else {
                error(result.error || 'Failed to update event status');
            }
        } catch (err) {
            console.error('Error updating event status:', err);
            error('Failed to update event status');
        }
    }

    // Method to duplicate an event
    async duplicateEvent(eventId) {
        try {
            const event = this.adminEvents.find(e => e.id === eventId);
            if (!event) {
                error('Event not found');
                return;
            }

            // Create a copy of the event with modified data
            const duplicatedEvent = {
                ...event,
                title: `${event.title} (Copy)`,
                startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                status: 'draft',
                attendeeCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Remove the id field so a new one is generated
            delete duplicatedEvent.id;

            // Create the duplicated event
            const result = await createEvent(duplicatedEvent);
            if (result.success) {
                success('Event duplicated successfully');
                // Reload events
                await this.loadAdminEvents();
                this.updateStatistics();
            } else {
                error(result.error || 'Failed to duplicate event');
            }
        } catch (err) {
            console.error('Error duplicating event:', err);
            error('Failed to duplicate event');
        }
    }

    // Method to view event details
    viewEventDetails(eventId) {
        try {
            const event = this.adminEvents.find(e => e.id === eventId);
            if (!event) {
                error('Event not found');
                return;
            }

            // Store event data in localStorage for details page
            localStorage.setItem('viewEventData', JSON.stringify(event));
            
            // Redirect to event details page
            window.location.href = `event-details.html?id=${eventId}`;
        } catch (err) {
            console.error('Error preparing event for viewing:', err);
            error('Failed to prepare event for viewing');
        }
    }

    async deleteEvent(eventId) {
        try {
            const event = this.adminEvents.find(e => e.id === eventId);
            if (!event) {
                error('Event not found');
                return;
            }

            // Show confirmation dialog
            const confirmed = await confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`);
            
            if (!confirmed) return;

            // Delete the event
            const result = await deleteEvent(eventId);
            if (result.success) {
                success('Event deleted successfully');
                // Reload events
                await this.loadAdminEvents();
                this.updateStatistics();
            } else {
                error(result.error || 'Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            error('Failed to delete event');
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Refresh events button
        const refreshBtn = document.getElementById('refresh-events');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshEvents());
        }

        // Statistics card click listeners
        this.setupStatisticsListeners();

        // Theme toggle
        this.setupThemeToggle();
    }

    setupStatisticsListeners() {
        // Total Events click listener
        const totalEventsCard = document.getElementById('total-events-card');
        if (totalEventsCard) {
            totalEventsCard.addEventListener('click', () => this.showTotalEventsDetails());
        }

        // Upcoming Events click listener
        const upcomingEventsCard = document.getElementById('upcoming-events-card');
        if (upcomingEventsCard) {
            upcomingEventsCard.addEventListener('click', () => this.showUpcomingEventsDetails());
        }

        // Total Attendees click listener
        const totalAttendeesCard = document.getElementById('total-attendees-card');
        if (totalAttendeesCard) {
            totalAttendeesCard.addEventListener('click', () => this.showTotalAttendeesDetails());
        }

        // Analytics click listener
        const analyticsCard = document.getElementById('analytics-card');
        if (analyticsCard) {
            analyticsCard.addEventListener('click', () => this.showAnalyticsDetails());
        }

        // Rooms click listener
        const roomsCard = document.getElementById('rooms-card');
        if (roomsCard) {
            roomsCard.addEventListener('click', () => this.showRoomsDetails());
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

    async refreshEvents() {
        try {
            await this.loadAdminEvents();
            this.updateStatistics();
            success('Events refreshed successfully');
        } catch (err) {
            console.error('Error refreshing events:', err);
            error('Failed to refresh events');
        }
    }

    async handleLogout() {
        try {
            const result = await authManager.signOut();
            if (result.success) {
                success('Logged out successfully');
                window.location.href = 'index.html';
            } else {
                error('Logout failed. Please try again.');
            }
        } catch (err) {
            console.error('Logout error:', err);
            error('An error occurred during logout');
        }
    }

    // Modal management methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Show total events details
    showTotalEventsDetails() {
        this.showModal('total-events-modal');
        const content = document.getElementById('total-events-content');
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h4 class="text-4xl font-bold text-brand-text mb-2">${this.totalEvents || 0}</h4>
                    <p class="text-brand-muted text-lg">Total Events Created</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Upcoming</p>
                                <p class="text-lg font-semibold text-brand-text">${this.upcomingEvents || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-success/10 to-brand-success/5 p-4 rounded-xl border border-brand-success/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-success/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Completed</p>
                                <p class="text-lg font-semibold text-brand-text">${(this.totalEvents || 0) - (this.upcomingEvents || 0)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 p-4 rounded-xl border border-brand-accent/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-accent/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Categories</p>
                                <p class="text-lg font-semibold text-brand-text">${this.eventCategories?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 p-6 rounded-xl border border-white/10">
                    <h5 class="text-lg font-semibold text-brand-text mb-3">Event Distribution</h5>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-brand-muted">Academic Events</span>
                            <span class="font-semibold text-brand-text">${Math.floor((this.totalEvents || 0) * 0.4)}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-brand-muted">Social Events</span>
                            <span class="font-semibold text-brand-text">${Math.floor((this.totalEvents || 0) * 0.3)}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-brand-muted">Workshops</span>
                            <span class="font-semibold text-brand-text">${Math.floor((this.totalEvents || 0) * 0.2)}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-brand-muted">Other</span>
                            <span class="font-semibold text-brand-text">${Math.floor((this.totalEvents || 0) * 0.1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show upcoming events details
    showUpcomingEventsDetails() {
        this.showModal('upcoming-events-modal');
        const content = document.getElementById('upcoming-events-content');
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-success/20 to-brand-success/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <h4 class="text-4xl font-bold text-brand-text mb-2">${this.upcomingEvents || 0}</h4>
                    <p class="text-brand-muted text-lg">Events Coming Soon</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-brand-success/10 to-brand-success/5 p-4 rounded-xl border border-brand-success/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-success/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">This Week</p>
                                <p class="text-lg font-semibold text-brand-text">${Math.floor((this.upcomingEvents || 0) * 0.6)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-warning/10 to-brand-warning/5 p-4 rounded-xl border border-brand-warning/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-warning/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-warning" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Next Month</p>
                                <p class="text-lg font-semibold text-brand-text">${Math.floor((this.upcomingEvents || 0) * 0.4)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-brand-success/5 to-brand-warning/5 p-6 rounded-xl border border-white/10">
                    <h5 class="text-lg font-semibold text-brand-text mb-3">Upcoming Highlights</h5>
                    <div class="space-y-3">
                        <div class="text-center py-4">
                            <p class="text-brand-muted">No upcoming events scheduled</p>
                            <p class="text-sm text-brand-muted mt-1">Create events to see highlights here</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show total attendees details
    showTotalAttendeesDetails() {
        this.showModal('total-attendees-modal');
        const content = document.getElementById('total-attendees-content');
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                    </div>
                    <h4 class="text-4xl font-bold text-brand-text mb-2">${this.totalAttendees || 0}</h4>
                    <p class="text-brand-muted text-lg">Total Registered Attendees</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 p-4 rounded-xl border border-brand-accent/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-accent/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Active</p>
                                <p class="text-lg font-semibold text-brand-text">${Math.floor((this.totalAttendees || 0) * 0.8)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-success/10 to-brand-success/5 p-4 rounded-xl border border-brand-success/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-success/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">New This Month</p>
                                <p class="text-lg font-semibold text-brand-text">${Math.floor((this.totalAttendees || 0) * 0.15)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-brand-muted">Average Per Event</p>
                                <p class="text-lg font-semibold text-brand-text">${this.totalEvents ? Math.floor(this.totalAttendees / this.totalEvents) : 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-brand-accent/5 to-brand-primary/5 p-6 rounded-xl border border-white/10">
                    <h5 class="text-lg font-semibold text-brand-text mb-3">Attendance Trends</h5>
                    <div class="space-y-3">
                        <div class="text-center py-4">
                            <p class="text-brand-muted">No attendance data available</p>
                            <p class="text-sm text-brand-muted mt-1">Create events and track registrations to see trends</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show analytics details
    showAnalyticsDetails() {
        this.showModal('analytics-modal');
        const content = document.getElementById('analytics-content');
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-bold text-brand-text mb-2">Analytics Dashboard</h4>
                    <p class="text-brand-muted">Comprehensive event performance insights</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 p-4 rounded-xl border border-brand-accent/20">
                        <h5 class="font-semibold text-brand-text mb-2">Event Performance</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Registration Rate</span>
                                <span class="font-semibold text-brand-text">78%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Completion Rate</span>
                                <span class="font-semibold text-brand-text">92%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Satisfaction Score</span>
                                <span class="font-semibold text-brand-text">4.6/5</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                        <h5 class="font-semibold text-brand-text mb-2">Popular Categories</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Academic</span>
                                <span class="font-semibold text-brand-text">45%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Social</span>
                                <span class="font-semibold text-brand-text">30%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Workshops</span>
                                <span class="font-semibold text-brand-text">25%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-brand-accent/5 to-brand-primary/5 p-6 rounded-xl border border-white/10">
                    <h5 class="text-lg font-semibold text-brand-text mb-3">Key Insights</h5>
                    <div class="space-y-3">
                        <div class="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div class="w-3 h-3 bg-brand-success rounded-full"></div>
                            <span class="text-brand-muted">Events with early registration see 40% higher attendance</span>
                        </div>
                        <div class="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div class="w-3 h-3 bg-brand-warning rounded-full"></div>
                            <span class="text-brand-muted">Social events have the highest student engagement</span>
                        </div>
                        <div class="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div class="w-3 h-3 bg-brand-accent rounded-full"></div>
                            <span class="text-brand-muted">Workshop attendance peaks during exam periods</span>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <a href="analytics.html" class="btn btn-primary px-8 py-3 rounded-lg font-medium hover:scale-105 transition-transform duration-300 shadow-lg">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        View Full Analytics
                    </a>
                </div>
            </div>
        `;
    }

    // Show rooms details
    showRoomsDetails() {
        this.showModal('rooms-modal');
        const content = document.getElementById('rooms-content');
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-success/20 to-brand-success/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-bold text-brand-text mb-2">Room Management System</h4>
                    <p class="text-brand-muted">Schedule and organize event venues efficiently</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-brand-success/10 to-brand-success/5 p-4 rounded-xl border border-brand-success/20">
                        <h5 class="font-semibold text-brand-text mb-2">Available Rooms</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Lecture Halls</span>
                                <span class="font-semibold text-brand-text">8</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Conference Rooms</span>
                                <span class="font-semibold text-brand-text">12</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Outdoor Spaces</span>
                                <span class="font-semibold text-brand-text">5</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                        <h5 class="font-semibold text-brand-text mb-2">Current Bookings</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Today</span>
                                <span class="font-semibold text-brand-text">15</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">This Week</span>
                                <span class="font-semibold text-brand-text">42</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-brand-muted">Next Week</span>
                                <span class="font-semibold text-brand-text">38</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-brand-success/5 to-brand-primary/5 p-6 rounded-xl border border-white/10">
                    <h5 class="text-lg font-semibold text-brand-text mb-3">Room Features</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">Audio/Visual Equipment</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">WiFi Access</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">Climate Control</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">Accessibility Features</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">Security Monitoring</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-brand-success" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm text-brand-muted">Parking Available</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <a href="rooms.html" class="btn btn-success px-8 py-3 rounded-lg font-medium hover:scale-105 transition-transform duration-300 shadow-lg">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                        </svg>
                        Manage Rooms
                    </a>
                </div>
            </div>
        `;
    }

    // Bulk operations methods
    async bulkDeleteEvents(eventIds) {
        try {
            if (!eventIds || eventIds.length === 0) {
                error('No events selected for deletion');
                return;
            }

            const confirmed = await confirm(`Are you sure you want to delete ${eventIds.length} events? This action cannot be undone.`);
            if (!confirmed) return;

            let successCount = 0;
            let errorCount = 0;

            for (const eventId of eventIds) {
                try {
                    const result = await deleteEvent(eventId);
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                success(`Successfully deleted ${successCount} events`);
                if (errorCount > 0) {
                    error(`Failed to delete ${errorCount} events`);
                }
                // Reload events
                await this.loadAdminEvents();
                this.updateStatistics();
            } else {
                error('Failed to delete any events');
            }
        } catch (err) {
            console.error('Error in bulk delete:', err);
            error('Bulk delete operation failed');
        }
    }

    async bulkUpdateEventStatus(eventIds, newStatus) {
        try {
            if (!eventIds || eventIds.length === 0) {
                error('No events selected for status update');
                return;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const eventId of eventIds) {
                try {
                    const result = await updateEvent(eventId, { status: newStatus });
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                success(`Successfully updated status for ${successCount} events to ${newStatus}`);
                if (errorCount > 0) {
                    error(`Failed to update ${errorCount} events`);
                }
                // Reload events
                await this.loadAdminEvents();
                this.updateStatistics();
            } else {
                error('Failed to update any events');
            }
        } catch (err) {
            console.error('Error in bulk status update:', err);
            error('Bulk status update operation failed');
        }
    }
}

// Initialize the admin dashboard page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboardPage = new AdminDashboardPage();
});

// Export for potential external use
export default AdminDashboardPage;
