// Use global Firebase instances from CDN
const { auth, db } = window.firebase;
import { toastManager } from '../toast.js';
import { emailService } from '../email.js';
import { emailConfig } from '../email-config.js';

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
        
        // Initialize email service with your EmailJS credentials
        this.initEmailService();
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

    async loadUserProfile() {
        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('📋 User profile loaded:', userData);
                console.log('📋 User displayName:', userData.displayName);
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
            refreshCertificatesBtn: document.getElementById('refresh-certificates'),
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
                    case 'refreshCertificatesBtn':
                        element.addEventListener('click', () => this.generateCompletedEventCertificates());
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
    async showCertificatesSection() {
        console.log('🎯 Showing certificates section...');
        const certificatesSection = document.getElementById('certificates-section');
        const registeredEvents = document.getElementById('registered-events');
        
        if (certificatesSection) certificatesSection.classList.remove('hidden');
        if (registeredEvents) registeredEvents.classList.add('hidden');
        
        console.log('🎯 Starting certificate generation...');
        // Generate certificates for completed events
        await this.generateCompletedEventCertificates();
        console.log('🎯 Certificate generation complete');
        
        // Update certificate preview with user data
        this.updateCertificatePreview();
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

            // Fetch user registrations from subcollection (same as loadUserEvents)
            console.log('📋 Fetching registrations from subcollection...');
            const registrationsRef = collection(db, 'users', this.currentUser.uid, 'registrations');
            const registrationsSnapshot = await getDocs(registrationsRef);
            
            if (registrationsSnapshot.empty) {
                console.log('📋 No registrations found in subcollection');
                return;
            }
            
            const registrations = {};
            registrationsSnapshot.forEach(doc => {
                const data = doc.data();
                registrations[data.eventId] = data;
            });
            
            console.log('📋 User Registrations from subcollection:', registrations);

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

                // Use the same logic as getEventStatus for consistency
                const eventStatus = this.getEventStatus(eventData.startAt);
                const isCompletedEvent = eventStatus === 'Completed';
                const isAttended = registration.attended === true;

                console.log(`Event ${eventId} Certificate Check:`, {
                    eventTitle: eventData.title,
                    eventStatus,
                    isCompletedEvent,
                    isAttended,
                    startAt: eventData.startAt,
                    registration: registration
                });

                // For now, generate certificate if event is completed and user is registered
                // The attended field might not be set yet, so we'll be lenient
                if (isCompletedEvent) {
                    console.log(`✅ Generating certificate for: ${eventData.title}`);

                    // Create certificate card
                    const certificateCard = document.createElement('div');
                    certificateCard.className = 'card p-6 hover:shadow-xl transition-all duration-300 group relative';
                    certificateCard.innerHTML = `
                        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <button onclick="window.showCertificateModal('${eventId}')" 
                                    class="btn btn-secondary px-3 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                </svg>
                                Preview
                            </button>
                            <button onclick="window.dashboardPage.downloadCertificate('${eventId}')" 
                                    class="btn btn-primary px-3 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                                Download
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
                if (certificatesGenerated > 0) {
                    noCertificatesMessage.classList.add('hidden');
                } else {
                    noCertificatesMessage.classList.remove('hidden');
                    // Update the message to be more helpful
                    noCertificatesMessage.innerHTML = `
                        <div class="w-16 h-16 bg-gradient-to-br from-brand-muted/20 to-brand-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-brand-muted" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-brand-text mb-2">No Certificates Available</h3>
                        <p class="text-brand-muted mb-6">You haven't completed any events yet. Register for events and attend them to earn certificates.</p>
                        <div class="text-sm text-brand-muted bg-brand-card/50 rounded-lg p-3">
                            <p><strong>Debug Info:</strong></p>
                            <p>Total registrations found: ${Object.keys(registrations).length}</p>
                            <p>Total events found: ${Object.keys(allEvents).length}</p>
                            <p>Completed events: ${Object.values(allEvents).filter(e => this.getEventStatus(e.startAt) === 'Completed').length}</p>
                        </div>
                    `;
                }
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
            
            // Get user's display name from userData, fallback to currentUser.displayName, then to 'Student'
            const studentName = userData?.displayName || this.currentUser?.displayName || 'Student';
            console.log('Certificate generation - Student name:', studentName);
            console.log('User data:', userData);
            console.log('Current user:', this.currentUser);

            // Use jsPDF for PDF generation
            const { jsPDF } = window.jspdf;
            const pdfDoc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Certificate background
            pdfDoc.setFillColor(255, 255, 255);
            pdfDoc.rect(0, 0, 297, 210, 'F');

            // Border
            pdfDoc.setDrawColor(0, 0, 0);
            pdfDoc.setLineWidth(1);
            pdfDoc.rect(10, 10, 277, 190);

            // Title
            pdfDoc.setFontSize(24);
            pdfDoc.setTextColor(0, 0, 0);
            pdfDoc.text('Certificate of Participation', 148, 50, { align: 'center' });

            // Participant Details
            pdfDoc.setFontSize(18);
            pdfDoc.text(`${studentName}`, 148, 80, { align: 'center' });
            
            // Student ID (if available)
            if (userData.studentId) {
                pdfDoc.setFontSize(14);
                pdfDoc.text(`Student ID: ${userData.studentId}`, 148, 90, { align: 'center' });
            }

            // Event Details
            pdfDoc.setFontSize(14);
            pdfDoc.text(`has successfully participated in the event`, 148, 110, { align: 'center' });
            pdfDoc.setFontSize(16);
            pdfDoc.setTextColor(0, 100, 200);
            pdfDoc.text(`${eventData.title}`, 148, 120, { align: 'center' });

            // Date
            pdfDoc.setFontSize(12);
            pdfDoc.setTextColor(0, 0, 0);
            pdfDoc.text(`Date: ${new Date(eventData.endAt.toDate()).toLocaleDateString()}`, 148, 140, { align: 'center' });

            // Save PDF
            pdfDoc.save(`Certificate_${eventData.title.replace(/\s+/g, '_')}.pdf`);

            this.toast.success('Certificate downloaded successfully');

        } catch (error) {
            console.error('Error downloading certificate:', error);
            this.toast.error('Failed to download certificate');
        }
    }

    printCertificate() {
        window.print();
    }
    
    // Update certificate preview with actual user data
    async updateCertificatePreview() {
        try {
            // Fetch user profile data
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const studentName = userData?.displayName || this.currentUser?.displayName || 'Student';
                
                // Update certificate preview elements
                const studentNameElement = document.getElementById('student-name');
                if (studentNameElement) {
                    studentNameElement.textContent = studentName;
                }
                
                // Update other preview elements if needed
                const eventNameElement = document.getElementById('event-name');
                if (eventNameElement) {
                    eventNameElement.textContent = 'Sample Event';
                }
                
                const eventCategoryElement = document.getElementById('event-category');
                if (eventCategoryElement) {
                    eventCategoryElement.textContent = 'University Event';
                }
                
                console.log('✅ Certificate preview updated with student name:', studentName);
            }
        } catch (error) {
            console.error('Error updating certificate preview:', error);
        }
    }
    
    // Show certificate modal for a specific event
    async showCertificateModal(eventId) {
        try {
            // Fetch event details
            const eventRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventRef);
            
            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                
                // Fetch user profile data
                const userRef = doc(db, 'users', this.currentUser.uid);
                const userDoc = await getDoc(userRef);
                const userData = userDoc.data();
                const studentName = userData?.displayName || this.currentUser?.displayName || 'Student';
                
                // Update certificate modal with event and user data
                const studentNameElement = document.getElementById('student-name');
                const eventNameElement = document.getElementById('event-name');
                const eventCategoryElement = document.getElementById('event-category');
                const eventDateElement = document.getElementById('event-date');
                
                if (studentNameElement) studentNameElement.textContent = studentName;
                if (eventNameElement) eventNameElement.textContent = eventData.title || 'Event';
                if (eventCategoryElement) eventCategoryElement.textContent = eventData.category || 'University Event';
                if (eventDateElement && eventData.endAt) {
                    eventDateElement.textContent = new Date(eventData.endAt.toDate()).toLocaleDateString();
                }
                
                // Show the modal
                const modal = document.getElementById('certificate-modal');
                if (modal) modal.classList.remove('hidden');
                
                console.log('✅ Certificate modal opened for event:', eventData.title);
            }
        } catch (error) {
            console.error('Error showing certificate modal:', error);
            this.toast.error('Failed to load certificate preview');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
    
    // Make functions globally available for onclick handlers
                    window.showCertificatesSection = async () => await window.dashboardPage.showCertificatesSection();
        window.hideCertificateModal = () => window.dashboardPage.hideCertificateModal();
        window.showCertificateModal = (eventId) => window.dashboardPage.showCertificateModal(eventId);
        window.debugCertificates = () => window.dashboardPage.generateCompletedEventCertificates();
    window.showProfileModal = () => window.dashboardPage.showProfileModal();
    window.hideProfileModal = () => window.dashboardPage.hideProfileModal();
    window.editProfile = () => window.dashboardPage.editProfile();
    window.hideEditProfileModal = () => window.dashboardPage.hideEditProfileModal();
    window.closeRegistrationModal = () => window.dashboardPage.closeRegistrationModal();
    window.closeUnregisterConfirmModal = () => window.dashboardPage.closeUnregisterConfirmModal();
    window.downloadCertificate = () => window.dashboardPage.downloadCertificate();
    window.printCertificate = () => window.dashboardPage.printCertificate();
});
