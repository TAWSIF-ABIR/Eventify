import { authManager } from '../auth.js';
import { dbManager } from '../db.js';
import { uiManager } from '../ui.js';
import { toast } from '../toast.js';
import { emailService } from '../email.js';
import { emailConfig } from '../email-config.js';

class AllEventsPage {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentUser = null;
        this.init();
        
        // Initialize email service with your EmailJS credentials
        this.initEmailService();
    }

    async init() {
        try {
            // Check authentication
            await this.checkAuth();
            
            // Setup UI
            this.setupUI();
            
            // Load events
            await this.loadEvents();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing AllEventsPage:', error);
            toast.error('Failed to initialize page');
        }
    }

    // Initialize email service with your EmailJS credentials
    async initEmailService() {
        try {
            const result = await emailService.init(
                emailConfig.publicKey,     // Your EmailJS Public Key
                emailConfig.serviceId,     // Your Gmail Service ID
                emailConfig.templateId     // Your Event Registration Template ID
            );
            
            if (result.success) {
                console.log('Email service initialized successfully');
            } else {
                console.error('Email service initialization failed:', result.error);
            }
        } catch (error) {
            console.error('Error initializing email service:', error);
        }
    }

    async checkAuth() {
        try {
            this.currentUser = await authManager.getCurrentUser();
            if (!this.currentUser) {
                window.location.href = 'auth-new.html';
                return;
            }
            
            // Update user info
            this.updateUserInfo();
            
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

        // Update user name and email
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userName) {
            userName.textContent = this.currentUser.displayName || 'Student';
        }
        
        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }
    }

    async loadEvents() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Get all events from database
            this.events = await dbManager.getAllEvents();
            this.filteredEvents = [...this.events];
            
            // Render events
            this.renderEvents();
            
        } catch (error) {
            console.error('Error loading events:', error);
            this.showEmptyState('Failed to load events. Please try again.');
        }
    }

    showLoadingState() {
        const loading = document.getElementById('events-loading');
        const empty = document.getElementById('events-empty');
        const grid = document.getElementById('events-grid');
        
        if (loading) loading.classList.remove('hidden');
        if (empty) empty.classList.add('hidden');
        
        // Clear existing events
        const existingEvents = grid.querySelectorAll('.event-card');
        existingEvents.forEach(card => card.remove());
    }

    showEmptyState(message = 'No events found') {
        const loading = document.getElementById('events-loading');
        const empty = document.getElementById('events-empty');
        
        if (loading) loading.classList.add('hidden');
        if (empty) {
            empty.classList.remove('hidden');
            const messageElement = empty.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    renderEvents() {
        const grid = document.getElementById('events-grid');
        const loading = document.getElementById('events-loading');
        const empty = document.getElementById('events-empty');
        
        // Hide loading state
        if (loading) loading.classList.add('hidden');
        
        // Clear existing events
        const existingEvents = grid.querySelectorAll('.event-card');
        existingEvents.forEach(card => card.remove());
        
        if (this.filteredEvents.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Hide empty state
        if (empty) empty.classList.add('hidden');
        
        // Render each event
        this.filteredEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            grid.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card card p-6 hover:scale-105 transition-all duration-300';
        
        const isRegistered = event.attendees && event.attendees.includes(this.currentUser.uid);
        const isUpcoming = new Date(event.startAt) > new Date();
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-brand-text mb-2">${event.title}</h3>
                    <div class="flex items-center space-x-2 mb-3">
                        <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isUpcoming ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-muted/20 text-brand-muted'
                        }">
                            ${isUpcoming ? 'Upcoming' : 'Past'}
                        </div>
                        ${isRegistered ? '<div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-primary/20 text-brand-primary">Registered</div>' : ''}
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
                                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
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
                    <button class="btn btn-primary px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                        <span>View Details</span>
                    </button>
                    ${!isRegistered && isUpcoming ? `
                        <button class="btn btn-secondary px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300 text-sm flex items-center space-x-2" onclick="allEventsPage.registerForEvent('${event.id}')">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            <span>Register</span>
                        </button>
                    ` : ''}
                </div>
                <div class="text-xs text-brand-muted bg-white/5 px-2 py-1 rounded">
                    ID: ${event.id.substring(0, 8)}
                </div>
            </div>
        `;
        
        // Add click event to track view
        card.addEventListener('click', () => {
            window.location.href = `event.html?id=${event.id}`;
            window.trackEventView(event.id);
        });
        
        return card;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async registerForEvent(eventId) {
        try {
            // Check if user is already registered
            const event = this.events.find(e => e.id === eventId);
            if (event && event.attendees && event.attendees.includes(this.currentUser.uid)) {
                toast.info('You are already registered for this event');
                return;
            }

            // Check event capacity
            if (event.capacity && event.attendeeCount >= event.capacity) {
                toast.error('Sorry, this event is already full');
                return;
            }

            // Prepare user data
            const userData = {
                name: this.currentUser.displayName || 'User',
                email: this.currentUser.email
            };

            // Import Firestore functions
            const { db } = await import('../firebase-init.js');
            const { 
                doc, 
                setDoc, 
                updateDoc, 
                increment, 
                collection, 
                query, 
                where, 
                getDocs 
            } = await import('firebase/firestore');

            // Check if already registered (double-check)
            const attendeesRef = collection(db, 'events', eventId, 'attendees');
            const attendeeQuery = query(attendeesRef, where('userId', '==', this.currentUser.uid));
            const attendeeSnapshot = await getDocs(attendeeQuery);

            if (!attendeeSnapshot.empty) {
                toast.info('You are already registered for this event');
                return;
            }

            // Add to user's registrations
            const userRegRef = doc(db, 'users', this.currentUser.uid, 'registrations', eventId);
            await setDoc(userRegRef, {
                eventId,
                registeredAt: new Date(),
                attended: false
            });

            // Add to event's attendees
            const eventAttendeeRef = doc(db, 'events', eventId, 'attendees', this.currentUser.uid);
            await setDoc(eventAttendeeRef, {
                userId: this.currentUser.uid,
                name: userData.name,
                email: userData.email,
                registeredAt: new Date(),
                status: 'registered',
                attended: false
            });

            // Increment attendee count
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                attendeeCount: increment(1)
            });

            // Update local data
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                this.events[eventIndex].attendeeCount = (this.events[eventIndex].attendeeCount || 0) + 1;
                if (!this.events[eventIndex].attendees) {
                    this.events[eventIndex].attendees = [];
                }
                this.events[eventIndex].attendees.push(this.currentUser.uid);
            }

            // Re-render events
            this.renderEvents();

            // Success toast
            toast.success('Successfully registered for the event!');
            
            // Send confirmation email
            try {
                const emailResult = await emailService.sendEventRegistrationEmail(userData, event);
                if (emailResult.success) {
                    toast.success('Registration confirmed! Check your email for details.');
                } else {
                    console.error('Email failed to send:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }
            
        } catch (error) {
            console.error('Error registering for event:', error);
            
            // Detailed error handling
            const errorMessage = 
                error.code === 'permission-denied' ? 'Permission denied. Please check your access.' :
                error.code === 'not-found' ? 'Event not found.' :
                'Failed to register for event. Please try again.';
            
            toast.error(errorMessage);
        }
    }

    filterEvents() {
        const searchTerm = document.getElementById('search-events').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        
        this.filteredEvents = this.events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                                event.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || event.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderEvents();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-events');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterEvents());
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterEvents());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-events');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadEvents());
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
        
        // Profile info button
        const profileInfoBtn = document.getElementById('profile-info-btn');
        if (profileInfoBtn) {
            profileInfoBtn.addEventListener('click', () => this.showProfileInfo());
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

    showProfileInfo() {
        // Show profile information in a modal or navigate to profile page
        toast.info('Profile information feature coming soon!');
    }
}

// Initialize the page
const allEventsPage = new AllEventsPage();

// Make it globally accessible for onclick handlers
window.allEventsPage = allEventsPage;
