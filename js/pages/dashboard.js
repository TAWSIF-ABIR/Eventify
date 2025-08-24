import { auth, db } from '../firebase-init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    limit,
    getDocs
} from 'firebase/firestore';
import { ToastManager } from '../toast.js';

class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.toast = new ToastManager();
        this.events = [];
        this.init();
    }

    async init() {
        try {
            // Check authentication state
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserProfile();
                    this.setupEventListeners();
                    this.loadUserEvents();
                } else {
                    window.location.href = 'login.html';
                }
            });
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.toast.error('Failed to initialize dashboard');
        }
    }

    async loadUserProfile() {
        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.updateUserInterface(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUserInterface(userData) {
        const elements = {
            userName: document.getElementById('user-name'),
            userEmail: document.getElementById('user-email'),
            welcomeName: document.getElementById('welcome-name'),
            userAvatar: document.getElementById('user-avatar')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                switch (key) {
                    case 'userName':
                        element.textContent = userData.displayName || 'Student';
                        break;
                    case 'userEmail':
                        element.textContent = userData.email || 'student@email.com';
                        break;
                    case 'welcomeName':
                        element.textContent = userData.displayName || 'Student';
                        break;
                    case 'userAvatar':
                        element.innerHTML = userData.displayName ? 
                            `<span class="text-sm font-bold">${userData.displayName.charAt(0).toUpperCase()}</span>` :
                            `<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>`;
                        break;
                }
            }
        });
    }

    async loadUserEvents() {
        const eventsContainer = document.getElementById('registered-events');
        const loadingElement = document.getElementById('events-loading');
        const emptyElement = document.getElementById('events-empty');
        
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');

        try {
            const registrationsRef = collection(db, 'users', this.currentUser.uid, 'registrations');
            const q = query(registrationsRef, orderBy('registeredAt', 'desc'));
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                if (loadingElement) loadingElement.classList.add('hidden');
                if (emptyElement) emptyElement.classList.remove('hidden');
                return;
            }

            const eventPromises = snapshot.docs.map(async (regDoc) => {
                const eventId = regDoc.data().eventId;
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);
                
                if (eventSnap.exists()) {
                    return { 
                        id: eventId, 
                        registeredAt: regDoc.data().registeredAt,
                        ...eventSnap.data() 
                    };
                }
                return null;
            });

            this.events = (await Promise.all(eventPromises)).filter(event => event !== null);
            
            this.renderEvents();
            this.updateStats();
            
            if (loadingElement) loadingElement.classList.add('hidden');
        } catch (error) {
            console.error('Error loading events:', error);
            this.toast.error('Failed to load events');
            if (loadingElement) loadingElement.classList.add('hidden');
        }
    }

    renderEvents() {
        const eventsContainer = document.getElementById('registered-events');
        const emptyElement = document.getElementById('events-empty');
        
        if (!eventsContainer) return;
        
        // Clear existing events
        eventsContainer.innerHTML = '';
        
        if (this.events.length === 0) {
            if (emptyElement) emptyElement.classList.remove('hidden');
            return;
        }
        
        if (emptyElement) emptyElement.classList.add('hidden');
        
        // Render new events
        this.events.forEach(event => {
            const eventElement = this.createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });
    }

    createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'card p-6 hover:scale-105 transition-all duration-300';
        eventDiv.setAttribute('data-event-id', event.id);
        
        const startDate = event.startAt ? new Date(event.startAt.seconds * 1000) : new Date();
        const status = this.getEventStatus(event.startAt);
        
        eventDiv.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-brand-text mb-2">${event.title || 'Event'}</h3>
                    <p class="text-brand-muted text-sm mb-1">${event.category || 'Category'}</p>
                    <p class="text-brand-muted text-sm">Date: ${startDate.toLocaleDateString()}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${this.getStatusClasses(status)}">
                    ${status}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-brand-muted">Registered: ${event.registeredAt ? new Date(event.registeredAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                <button onclick="window.unregisterFromEvent('${event.id}')" class="btn btn-danger px-3 py-1 text-sm rounded-lg hover:scale-105 transition-transform duration-300">
                    Unregister
                </button>
            </div>
        `;
        
        return eventDiv;
    }

    getEventStatus(startAt) {
        if (!startAt) return 'TBD';
        
        const now = new Date();
        const eventTime = new Date(startAt.seconds * 1000);
        
        if (eventTime < now) return 'Completed';
        if (eventTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'This Week';
        return 'Upcoming';
    }

    getStatusClasses(status) {
        const statusClassMap = {
            'Completed': 'bg-brand-success/20 text-brand-success',
            'This Week': 'bg-brand-warning/20 text-brand-warning',
            'Upcoming': 'bg-brand-primary/20 text-brand-primary',
            'TBD': 'bg-brand-muted/20 text-brand-muted'
        };
        
        return statusClassMap[status] || statusClassMap['TBD'];
    }

    updateStats() {
        const statsElements = {
            totalEvents: document.getElementById('total-events'),
            upcomingEvents: document.getElementById('upcoming-events'),
            completedEvents: document.getElementById('completed-events'),
            certificatesCount: document.getElementById('certificates-count')
        };

        const stats = {
            totalEvents: this.events.length,
            upcomingEvents: this.events.filter(e => this.getEventStatus(e.startAt) === 'Upcoming').length,
            completedEvents: this.events.filter(e => this.getEventStatus(e.startAt) === 'Completed').length,
            certificatesCount: this.events.filter(e => this.getEventStatus(e.startAt) === 'Completed').length
        };

        Object.entries(statsElements).forEach(([key, element]) => {
            if (element) element.textContent = stats[key];
        });
    }

    setupEventListeners() {
        const elements = {
            logoutBtn: document.getElementById('logout-btn'),
            refreshBtn: document.getElementById('refresh-events'),
            themeToggle: document.getElementById('theme-toggle')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                switch (key) {
                    case 'logoutBtn':
                        element.addEventListener('click', () => this.handleLogout());
                        break;
                    case 'refreshBtn':
                        element.addEventListener('click', () => this.loadUserEvents());
                        break;
                    case 'themeToggle':
                        element.addEventListener('click', () => this.toggleTheme());
                        break;
                }
            }
        });
    }

    async handleLogout() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.toast.error('Logout failed');
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
});

// Global function for unregistering from events
window.unregisterFromEvent = async function(eventId) {
    if (window.dashboardPage) {
        try {
            const { db } = await import('../firebase-init.js');
            const { deleteDoc, doc, updateDoc, increment } = await import('firebase/firestore');
            
            const currentUser = window.dashboardPage.currentUser;
            
            // Remove from user's registrations
            const userRegRef = doc(db, 'users', currentUser.uid, 'registrations', eventId);
            await deleteDoc(userRegRef);
            
            // Remove from event's attendees
            const eventAttendeeRef = doc(db, 'events', eventId, 'attendees', currentUser.uid);
            await deleteDoc(eventAttendeeRef);
            
            // Decrement attendee count
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                attendeeCount: increment(-1)
            });
            
            // Reload events
            window.dashboardPage.loadUserEvents();
            
            window.dashboardPage.toast.success('Successfully unregistered from event');
        } catch (error) {
            console.error('Error unregistering:', error);
            window.dashboardPage.toast.error('Failed to unregister from event');
        }
    }
};
