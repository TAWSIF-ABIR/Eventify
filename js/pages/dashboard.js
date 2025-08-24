// Use global Firebase instances from CDN
const { auth, db } = window.firebase;
import { toastManager } from '../toast.js';

// Import Firebase functions from the global scope
const { 
    onAuthStateChanged, 
    signOut,
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    limit,
    getDocs,
    deleteDoc,
    updateDoc,
    increment
} = window.firebase;

class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.toast = toastManager;
        this.events = [];
        this.init();
    }

    async init() {
        console.log('=== DASHBOARD INITIALIZATION STARTED ===');
        try {
            console.log('Setting up authentication state listener...');
            // Check authentication state
            onAuthStateChanged(auth, async (user) => {
                console.log('Auth state changed:', user);
                if (user) {
                    console.log('✅ User authenticated:', user.uid);
                    this.currentUser = user;
                    await this.loadUserProfile();
                    this.setupEventListeners();
                    console.log('Starting to load user events...');
                    await this.loadUserEvents();
                } else {
                    console.log('❌ No user authenticated, redirecting to login');
                    window.location.href = 'auth-new.html';
                }
            });
            console.log('Auth state listener set up successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
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
        console.log('=== LOADING USER EVENTS ===');
        const eventsContainer = document.getElementById('registered-events');
        const loadingElement = document.getElementById('events-loading');
        const emptyElement = document.getElementById('events-empty');
        
        console.log('Container elements found:', {
            eventsContainer: !!eventsContainer,
            loadingElement: !!loadingElement,
            emptyElement: !!emptyElement
        });
        
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');

        try {
            console.log('Current user:', this.currentUser);
            console.log('User UID:', this.currentUser?.uid);
            
            if (!this.currentUser?.uid) {
                console.error('No current user UID found');
                this.toast.error('User not authenticated');
                return;
            }

            console.log('Querying user registrations...');
            const registrationsRef = collection(db, 'users', this.currentUser.uid, 'registrations');
            console.log('Registrations collection ref:', registrationsRef);
            
            const q = query(registrationsRef, orderBy('registeredAt', 'desc'));
            console.log('Query created:', q);
            
            console.log('Executing query...');
            const snapshot = await getDocs(q);
            console.log('Query result:', snapshot);
            console.log('Number of registrations found:', snapshot.size);
            
            if (snapshot.empty) {
                console.log('No registrations found, showing empty state');
                if (loadingElement) loadingElement.classList.add('hidden');
                if (emptyElement) emptyElement.classList.remove('hidden');
                return;
            }

            console.log('Processing registrations...');
            const eventPromises = snapshot.docs.map(async (regDoc, index) => {
                const eventId = regDoc.data().eventId;
                console.log(`Registration ${index + 1}:`, regDoc.data());
                console.log(`Event ID: ${eventId}`);
                
                const eventRef = doc(db, 'events', eventId);
                console.log(`Event ref for ${eventId}:`, eventRef);
                
                const eventSnap = await getDoc(eventRef);
                console.log(`Event snapshot for ${eventId}:`, eventSnap);
                
                if (eventSnap.exists()) {
                    const eventData = eventSnap.data();
                    console.log(`Event data for ${eventId}:`, eventData);
                    return { 
                        id: eventId, 
                        registeredAt: regDoc.data().registeredAt,
                        ...eventData 
                    };
                } else {
                    console.log(`Event ${eventId} not found in events collection`);
                    return null;
                }
            });

            console.log('Waiting for all event promises to resolve...');
            this.events = (await Promise.all(eventPromises)).filter(event => event !== null);
            console.log('Final events array:', this.events);
            console.log('Number of valid events:', this.events.length);
            
            this.renderEvents();
            this.updateStats();
            
            if (loadingElement) loadingElement.classList.add('hidden');
            console.log('=== EVENTS LOADING COMPLETE ===');
        } catch (error) {
            console.error('❌ Error loading events:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            this.toast.error(`Failed to load events: ${error.message}`);
            
            if (loadingElement) loadingElement.classList.add('hidden');
            
            // Show error state
            if (eventsContainer) {
                eventsContainer.innerHTML = `
                    <div class="text-center py-12">
                        <div class="text-red-400 mb-4">Failed to load events</div>
                        <div class="text-sm text-brand-muted mb-4">Error: ${error.message}</div>
                        <button onclick="window.dashboardPage.loadUserEvents()" class="btn btn-primary px-4 py-2 rounded-lg">
                            Retry Loading
                        </button>
                    </div>
                `;
            }
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
        eventDiv.className = 'card event-card p-6 hover:scale-105 transition-all duration-300';
        eventDiv.setAttribute('data-event-id', event.id);
        
        const startDate = event.startAt ? new Date(event.startAt.seconds * 1000) : new Date();
        const status = this.getEventStatus(event.startAt);
        
        // Format venue information
        const location = event.location || 'TBD';
        const room = event.room || '';
        const venue = room ? `${location} - ${room}` : location;
        
        // Format attending count
        const attendeeCount = event.attendeeCount || 0;
        
        // Format date and time
        const dateDisplay = startDate.toLocaleDateString();
        const timeDisplay = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        eventDiv.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-brand-text mb-2">${event.title || 'Event'}</h3>
                    <div class="space-y-1 text-sm text-brand-muted">
                        <p>${event.category || 'Category'}</p>
                        <p>${dateDisplay}</p>
                        <p>${timeDisplay}</p>
                        <p>📍 ${venue}</p>
                        <p>👥 ${attendeeCount} attending (Firebase)</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium status-badge ${this.getStatusClasses(status)} ml-4">
                    ${status}
                </span>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-white/10">
                <span class="text-sm text-brand-muted">Registered: ${event.registeredAt ? new Date(event.registeredAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                <button onclick="window.dashboardPage.unregisterFromEvent('${event.id}')" class="btn btn-danger px-3 py-1 text-sm rounded-lg hover:scale-105 transition-transform duration-300">
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
            thisWeek: document.getElementById('this-week'),
            completedEvents: document.getElementById('completed-events')
        };

        const stats = {
            totalEvents: this.events.length,
            upcomingEvents: this.events.filter(e => this.getEventStatus(e.startAt) === 'Upcoming').length,
            thisWeek: this.events.filter(e => this.getEventStatus(e.startAt) === 'This Week').length,
            completedEvents: this.events.filter(e => this.getEventStatus(e.startAt) === 'Completed').length
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
            window.location.href = 'auth-new.html';
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

    // Add missing functions for HTML onclick handlers
    async unregisterFromEvent(eventId) {
        try {
            const event = this.events.find(e => e.id === eventId);
            if (!event) {
                this.toast.error('Event not found');
                return;
            }

            // Remove from user's registrations
            const userRegistrationsRef = collection(db, 'users', this.currentUser.uid, 'registrations');
            const existingRegistration = query(userRegistrationsRef, where('eventId', '==', eventId));
            const existingSnapshot = await getDocs(existingRegistration);
            
            if (existingSnapshot.empty) {
                this.toast.info('You are not registered for this event');
                return;
            }

            // Delete registration
            const registrationDoc = existingSnapshot.docs[0];
            await deleteDoc(registrationDoc.ref);

            // Update event attendee count
            try {
                const eventRef = doc(db, 'events', eventId);
                await updateDoc(eventRef, {
                    attendeeCount: increment(-1)
                });
            } catch (error) {
                console.error('Failed to update event attendee count:', error);
            }

            // Remove from local events array
            this.events = this.events.filter(e => e.id !== eventId);
            
            // Refresh display
            this.renderEvents();
            this.updateStats();
            
            this.toast.success('Successfully unregistered from event');
        } catch (error) {
            console.error('Error unregistering from event:', error);
            this.toast.error('Failed to unregister from event');
        }
    }

    // Add other missing functions
    showCertificatesSection() {
        const certificatesSection = document.getElementById('certificates-section');
        const registeredEvents = document.getElementById('registered-events');
        
        if (certificatesSection) certificatesSection.classList.remove('hidden');
        if (registeredEvents) registeredEvents.classList.add('hidden');
    }

    hideCertificateModal() {
        const modal = document.getElementById('certificate-modal');
        if (modal) modal.classList.add('hidden');
    }

    showProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.remove('hidden');
    }

    hideProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
    }

    editProfile() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) modal.classList.remove('hidden');
    }

    hideEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) modal.classList.add('hidden');
    }

    closeRegistrationModal() {
        const modal = document.getElementById('registration-modal');
        if (modal) modal.classList.add('hidden');
    }

    closeUnregisterConfirmModal() {
        const modal = document.getElementById('unregister-confirm-modal');
        if (modal) modal.classList.add('hidden');
    }

    // Fetch and generate certificates for completed events
    async generateCompletedEventCertificates() {
        try {
            console.group('Certificate Generation Debug');
            console.log('🔍 Starting comprehensive certificate generation...');

            // Validate current user
            if (!this.currentUser) {
                console.error('❌ No current user found');
                return;
            }

            // Prepare certificates container
            const certificatesContainer = document.querySelector('#certificates-section .grid');
            if (!certificatesContainer) {
                console.error('❌ Certificates container not found');
                return;
            }

            // Clear existing certificates
            certificatesContainer.innerHTML = '';

            // Fetch user profile to get registrations
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                console.error('❌ User document not found');
                return;
            }

            const userData = userDoc.data();
            const registrations = userData.registrations || {};
            console.log('📋 User Registrations:', registrations);

            // Fetch all events
            const eventsRef = collection(db, 'events');
            const eventsSnapshot = await getDocs(eventsRef);
            const allEvents = {};
            eventsSnapshot.forEach(doc => {
                allEvents[doc.id] = { ...doc.data(), id: doc.id };
            });

            // Track certificates generated
            let certificatesGenerated = 0;

            // Process registrations
            for (const [eventId, registration] of Object.entries(registrations)) {
                const eventData = allEvents[eventId];
                
                if (!eventData) {
                    console.warn(`⚠️ Event ${eventId} not found`);
                    continue;
                }

                // Expanded certificate generation conditions
                const isCompletedEvent = eventData.status === 'completed';
                const isAttended = registration.attended === true;

                console.log(`Event ${eventId} Certificate Check:`, {
                    eventTitle: eventData.title,
                    isCompletedEvent,
                    isAttended
                });

                if (isCompletedEvent && isAttended) {
                    console.log(`✅ Generating certificate for: ${eventData.title}`);

                    // Create certificate card
                    const certificateCard = document.createElement('div');
                    certificateCard.className = 'card p-6 hover:shadow-xl transition-all duration-300 group relative';
                    certificateCard.innerHTML = `
                        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="window.dashboardPage.downloadCertificate('${eventId}')" 
                                    class="btn btn-primary px-4 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                                Download Certificate
                            </button>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-brand-text mb-2">${eventData.title}</h3>
                            <p class="text-brand-muted text-sm mb-4">Certificate of Participation</p>
                            <div class="text-sm text-brand-muted">
                                <p>Issued on: ${new Date(eventData.endAt.toDate()).toLocaleDateString()}</p>
                                <p>Category: ${eventData.category || 'University Event'}</p>
                            </div>
                        </div>
                    `;

                    // Append to certificates container
                    certificatesContainer.appendChild(certificateCard);
                    certificatesGenerated++;
                }
            }

            console.log(`📊 Total Certificates Generated: ${certificatesGenerated}`);

            // Update no certificates message
            const noCertificatesMessage = certificatesContainer.querySelector('.col-span-full');
            if (noCertificatesMessage) {
                certificatesGenerated > 0 
                    ? noCertificatesMessage.classList.add('hidden')
                    : noCertificatesMessage.classList.remove('hidden');
            }

            console.groupEnd();
        } catch (error) {
            console.error('❌ Certificate Generation Error:', error);
            console.groupEnd();
        }
    }

    // Download certificate as PDF
    async downloadCertificate(eventId) {
        try {
            // Fetch event details
            const eventRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                this.toast.error('Event details not found');
                return;
            }

            const eventData = eventDoc.data();

            // Fetch user profile for additional details
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            // Use jsPDF for PDF generation
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Certificate background
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 297, 210, 'F');

            // Border
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(10, 10, 277, 190);

            // Title
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text('Certificate of Participation', 148, 50, { align: 'center' });

            // Participant Details
            doc.setFontSize(18);
            doc.text(`${this.currentUser.displayName}`, 148, 80, { align: 'center' });
            
            // Student ID (if available)
            if (userData.studentId) {
                doc.setFontSize(14);
                doc.text(`Student ID: ${userData.studentId}`, 148, 90, { align: 'center' });
            }

            // Event Details
            doc.setFontSize(14);
            doc.text(`has successfully participated in the event`, 148, 110, { align: 'center' });
            doc.setFontSize(16);
            doc.setTextColor(0, 100, 200);
            doc.text(`${eventData.title}`, 148, 120, { align: 'center' });

            // Date
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Date: ${new Date(eventData.endAt.toDate()).toLocaleDateString()}`, 148, 140, { align: 'center' });

            // Save PDF
            doc.save(`Certificate_${eventData.title.replace(/\s+/g, '_')}.pdf`);

            this.toast.success('Certificate downloaded successfully');

        } catch (error) {
            console.error('Error downloading certificate:', error);
            this.toast.error('Failed to download certificate');
        }
    }

    printCertificate() {
        window.print();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
    
    // Make functions globally available for onclick handlers
    window.showCertificatesSection = () => window.dashboardPage.showCertificatesSection();
    window.hideCertificateModal = () => window.dashboardPage.hideCertificateModal();
    window.showProfileModal = () => window.dashboardPage.showProfileModal();
    window.hideProfileModal = () => window.dashboardPage.hideProfileModal();
    window.editProfile = () => window.dashboardPage.editProfile();
    window.hideEditProfileModal = () => window.dashboardPage.hideEditProfileModal();
    window.closeRegistrationModal = () => window.dashboardPage.closeRegistrationModal();
    window.closeUnregisterConfirmModal = () => window.dashboardPage.closeUnregisterConfirmModal();
    window.downloadCertificate = () => window.dashboardPage.downloadCertificate();
    window.printCertificate = () => window.dashboardPage.printCertificate();
});
