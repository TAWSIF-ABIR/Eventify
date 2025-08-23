import { auth, db } from '../firebase-init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { ToastManager } from '../toast.js';

class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.toast = new ToastManager();
        this.init();
    }

    async init() {
        console.log('Dashboard initializing...');
        
        // Check authentication state
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('User authenticated:', user);
                this.currentUser = user;
                await this.loadUserData();
                this.setupEventListeners();
                this.loadUserEvents();
            } else {
                console.log('No user authenticated, redirecting to login');
                window.location.href = 'login.html';
            }
        });
    }

    async loadUserData() {
        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.currentUser = { ...this.currentUser, ...userData };
                this.updateDashboardDisplay();
                console.log('User data loaded:', userData);
            } else {
                console.log('No user document found');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.toast.error('Failed to load user data');
        }
    }

    updateDashboardDisplay() {
        // Update user info in sidebar
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const welcomeName = document.getElementById('welcome-name');
        
        if (userName) userName.textContent = this.currentUser.displayName || 'Student';
        if (userEmail) userEmail.textContent = this.currentUser.email || 'student@email.com';
        if (welcomeName) welcomeName.textContent = this.currentUser.displayName || 'Student';
        
        // Update modal profile info
        const modalUserName = document.getElementById('modal-user-name');
        const modalUserEmail = document.getElementById('modal-user-email');
        const modalProfileName = document.getElementById('modal-profile-name');
        const modalProfileEmail = document.getElementById('modal-profile-email');
        const modalProfileStudentId = document.getElementById('modal-profile-student-id');
        const modalProfileSession = document.getElementById('modal-profile-session');
        
        if (modalUserName) modalUserName.textContent = this.currentUser.displayName || 'Student';
        if (modalUserEmail) modalUserEmail.textContent = this.currentUser.email || 'student@email.com';
        if (modalProfileName) modalProfileName.textContent = this.currentUser.displayName || 'Loading...';
        if (modalProfileEmail) modalProfileEmail.textContent = this.currentUser.email || 'Loading...';
        if (modalProfileStudentId) modalProfileStudentId.textContent = this.currentUser.studentId || 'Loading...';
        if (modalProfileSession) modalProfileSession.textContent = this.currentUser.session || 'Loading...';
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
            refreshBtn.addEventListener('click', () => this.loadUserEvents());
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        console.log('Dashboard event listeners set up');
    }

    async loadUserEvents() {
        try {
            const eventsContainer = document.getElementById('registered-events');
            const loadingElement = document.getElementById('events-loading');
            const emptyElement = document.getElementById('events-empty');
            
            if (loadingElement) loadingElement.style.display = 'block';
            if (emptyElement) emptyElement.style.display = 'none';
            
            // Query user's registered events
            const registrationsRef = collection(db, 'users', this.currentUser.uid, 'registrations');
            const q = query(registrationsRef, orderBy('registeredAt', 'desc'));
            
            onSnapshot(q, (snapshot) => {
                const events = [];
                snapshot.forEach((doc) => {
                    events.push({ id: doc.id, ...doc.data() });
                });
                
                this.displayEvents(events);
                this.updateStats(events);
                
                if (loadingElement) loadingElement.style.display = 'none';
            });
            
        } catch (error) {
            console.error('Error loading events:', error);
            this.toast.error('Failed to load events');
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    displayEvents(events) {
        const eventsContainer = document.getElementById('registered-events');
        const emptyElement = document.getElementById('events-empty');
        
        if (!eventsContainer) return;
        
        if (events.length === 0) {
            if (emptyElement) emptyElement.style.display = 'block';
            return;
        }
        
        if (emptyElement) emptyElement.style.display = 'none';
        
        // Clear existing events
        const existingEvents = eventsContainer.querySelectorAll('[data-event-id]');
        existingEvents.forEach(el => el.remove());
        
        // Add new events
        events.forEach(event => {
            const eventElement = this.createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });
    }

    createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'card p-6 hover:scale-105 transition-all duration-300';
        eventDiv.setAttribute('data-event-id', event.id);
        
        const eventDate = event.eventDate ? new Date(event.eventDate.toDate()).toLocaleDateString() : 'TBD';
        const status = this.getEventStatus(event.eventDate);
        
        eventDiv.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-brand-text mb-2">${event.eventName || 'Event'}</h3>
                    <p class="text-brand-muted text-sm mb-1">${event.eventCategory || 'Category'}</p>
                    <p class="text-brand-muted text-sm">Date: ${event.eventDate}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${this.getStatusClasses(status)}">
                    ${status}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-brand-muted">Registered: ${event.registeredAt ? new Date(event.registeredAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                <button onclick="unregisterFromEvent('${event.id}')" class="btn btn-danger px-3 py-1 text-sm rounded-lg hover:scale-105 transition-transform duration-300">
                    Unregister
                </button>
            </div>
        `;
        
        return eventDiv;
    }

    getEventStatus(eventDate) {
        if (!eventDate) return 'TBD';
        
        const now = new Date();
        const eventTime = eventDate.toDate ? eventDate.toDate() : new Date(eventDate);
        
        if (eventTime < now) return 'Completed';
        if (eventTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'This Week';
        return 'Upcoming';
    }

    getStatusClasses(status) {
        switch (status) {
            case 'Completed':
                return 'bg-brand-success/20 text-brand-success';
            case 'This Week':
                return 'bg-brand-warning/20 text-brand-warning';
            case 'Upcoming':
                return 'bg-brand-primary/20 text-brand-primary';
            default:
                return 'bg-brand-muted/20 text-brand-muted';
        }
    }

    updateStats(events) {
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => this.getEventStatus(e.eventDate) === 'Upcoming').length;
        const thisWeek = events.filter(e => this.getEventStatus(e.eventDate) === 'This Week').length;
        const completed = events.filter(e => this.getEventStatus(e.eventDate) === 'Completed').length;
        
        const totalElement = document.getElementById('total-events');
        const upcomingElement = document.getElementById('upcoming-events');
        const thisWeekElement = document.getElementById('this-week');
        const completedElement = document.getElementById('completed-events');
        
        if (totalElement) totalElement.textContent = totalEvents;
        if (upcomingElement) upcomingElement.textContent = upcomingEvents;
        if (thisWeekElement) thisWeekElement.textContent = thisWeek;
        if (completedElement) completedElement.textContent = completed;
    }

    async handleLogout() {
        try {
            await signOut(auth);
            console.log('User logged out');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.toast.error('Logout failed');
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    showCertificatesSection() {
        const mainContent = document.querySelector('.space-y-4');
        const certificatesSection = document.getElementById('certificates-section');
        
        if (mainContent && certificatesSection) {
            // Hide other sections
            const registeredEventsSection = mainContent.querySelector('.space-y-4');
            if (registeredEventsSection) registeredEventsSection.style.display = 'none';
            
            // Show certificates section
            certificatesSection.classList.remove('hidden');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard DOM loaded, initializing...');
    window.dashboardPage = new DashboardPage();
});

// Global function for unregistering from events
window.unregisterFromEvent = async function(eventId) {
    if (confirm('Are you sure you want to unregister from this event?')) {
        try {
            // Remove from user's registrations
            const { db } = await import('../firebase-init.js');
            const { deleteDoc, doc } = await import('firebase/firestore');
            
            await deleteDoc(doc(db, 'users', window.dashboardPage.currentUser.uid, 'registrations', eventId));
            
            if (window.dashboardPage.toast) {
                window.dashboardPage.toast.success('Successfully unregistered from event');
            }
        } catch (error) {
            console.error('Error unregistering:', error);
            if (window.dashboardPage.toast) {
                window.dashboardPage.toast.error('Failed to unregister from event');
            }
        }
    }
};
