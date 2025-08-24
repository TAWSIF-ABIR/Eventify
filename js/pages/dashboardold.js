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
    deleteDoc, 
    updateDoc, 
    increment 
} from 'firebase/firestore';
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
            
            onSnapshot(q, async (snapshot) => {
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

                const events = (await Promise.all(eventPromises)).filter(event => event !== null);
                
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
        const upcomingEvents = events.filter(e => this.getEventStatus(e.startAt) === 'Upcoming').length;
        const thisWeek = events.filter(e => this.getEventStatus(e.startAt) === 'This Week').length;
        const completed = events.filter(e => this.getEventStatus(e.startAt) === 'Completed').length;
        
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
    // Create a custom confirmation modal
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    confirmationModal.innerHTML = `
        <div class="bg-white dark:bg-brand-card rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div class="text-center">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-brand-text mb-2">Unregister from Event</h3>
                <p class="text-brand-muted mb-6">Are you sure you want to unregister from this event?</p>
                <div class="flex space-x-3 justify-center">
                    <button id="cancel-unregister" class="btn btn-secondary px-4 py-2">Cancel</button>
                    <button id="confirm-unregister" class="btn btn-danger px-4 py-2">Unregister</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(confirmationModal);

    // Toast notification function
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg font-medium transform translate-x-full transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    return new Promise((resolve, reject) => {
        const cancelBtn = confirmationModal.querySelector('#cancel-unregister');
        const confirmBtn = confirmationModal.querySelector('#confirm-unregister');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(confirmationModal);
            resolve(false);
        });

        confirmBtn.addEventListener('click', async () => {
            try {
                // Disable buttons during operation
                cancelBtn.disabled = true;
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = 'Unregistering...';

                // Import necessary Firestore functions
                const { db } = await import('../firebase-init.js');
                const { deleteDoc, doc, updateDoc, increment, getDoc } = await import('firebase/firestore');
                
                const currentUser = window.dashboardPage.currentUser;
                
                // Verify event exists
                const eventRef = doc(db, 'events', eventId);
                const eventDoc = await getDoc(eventRef);
                if (!eventDoc.exists()) {
                    throw new Error('Event no longer exists');
                }

                // Remove from user's registrations
                const userRegRef = doc(db, 'users', currentUser.uid, 'registrations', eventId);
                await deleteDoc(userRegRef);
                
                // Remove from event's attendees
                const eventAttendeeRef = doc(db, 'events', eventId, 'attendees', currentUser.uid);
                await deleteDoc(eventAttendeeRef);
                
                // Decrement attendee count
                await updateDoc(eventRef, {
                    attendeeCount: increment(-1)
                });
                
                // Remove modal
                document.body.removeChild(confirmationModal);
                
                // Show success toast
                showToast('Successfully unregistered from the event', 'success');
                
                // Reload events to reflect changes
                if (window.dashboardPage) {
                    window.dashboardPage.loadUserEvents();
                }
                
                resolve(true);
            } catch (error) {
                console.error('Detailed unregistration error:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
                
                // Remove modal
                document.body.removeChild(confirmationModal);
                
                // Show detailed error toast
                const errorMessage = 
                    error.code === 'permission-denied' ? 'Permission denied. Please check your access.' :
                    error.code === 'not-found' ? 'Event or registration not found.' :
                    'Failed to unregister from event. Please try again.';
                
                showToast(errorMessage, 'error');
                
                reject(error);
            } finally {
                // Ensure buttons are re-enabled if an error occurs
                if (cancelBtn && confirmBtn) {
                    cancelBtn.disabled = false;
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = 'Unregister';
                }
            }
        });
    });
};
