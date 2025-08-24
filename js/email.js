// Simple Email Service using EmailJS
// Works with your personal Gmail account (morsalinislamalvy@gmail.com)

class EmailService {
  constructor() {
    this.isInitialized = false;
    this.emailjsUserId = null;
    this.serviceId = null;
    this.templateId = null;
  }

  // Initialize EmailJS with your credentials
  async init(emailjsUserId, serviceId, templateId) {
    try {
      this.emailjsUserId = emailjsUserId;
      this.serviceId = serviceId;
      this.templateId = templateId;
      
      // Load EmailJS script if not already loaded
      if (!window.emailjs) {
        await this.loadEmailJS();
      }
      
      // Initialize EmailJS
      window.emailjs.init(emailjsUserId);
      this.isInitialized = true;
      
      console.log('Email service initialized successfully');
      return { success: true, message: 'Email service ready' };
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return { success: false, error: error.message };
    }
  }

  // Load EmailJS script dynamically
  async loadEmailJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Send event registration confirmation email
  async sendEventRegistrationEmail(userData, eventData) {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const templateParams = {
        to_email: userData.email,
        to_name: userData.name || userData.displayName,
        event_title: eventData.title,
        event_date: new Date(eventData.startAt?.seconds * 1000).toLocaleDateString(),
        event_time: new Date(eventData.startAt?.seconds * 1000).toLocaleTimeString(),
        event_location: eventData.location || 'TBD',
        event_description: eventData.description || 'No description available'
      };

      const result = await window.emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return { 
        success: true, 
        message: 'Event registration email sent successfully',
        messageId: result.text
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userData) {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const templateParams = {
        to_email: userData.email,
        to_name: userData.displayName || userData.name,
        user_role: userData.role || 'user',
        student_id: userData.studentId || 'N/A',
        session: userData.session || 'N/A'
      };

      const result = await window.emailjs.send(
        this.serviceId,
        'welcome_template', // You'll need to create this template
        templateParams
      );

      return { 
        success: true, 
        message: 'Welcome email sent successfully',
        messageId: result.text
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send custom notification email
  async sendCustomEmail(to, subject, message) {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const templateParams = {
        to_email: to,
        subject: subject,
        message: message
      };

      const result = await window.emailjs.send(
        this.serviceId,
        'custom_template', // You'll need to create this template
        templateParams
      );

      return { 
        success: true, 
        message: 'Custom email sent successfully',
        messageId: result.text
      };
    } catch (error) {
      console.error('Error sending custom email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send event reminder email
  async sendEventReminder(userData, eventData) {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const templateParams = {
        to_email: userData.email,
        to_name: userData.name || userData.displayName,
        event_title: eventData.title,
        event_date: new Date(eventData.startAt?.seconds * 1000).toLocaleDateString(),
        event_time: new Date(eventData.startAt?.seconds * 1000).toLocaleTimeString(),
        event_location: eventData.location || 'TBD'
      };

      const result = await window.emailjs.send(
        this.serviceId,
        'reminder_template', // You'll need to create this template
        templateParams
      );

      return { 
        success: true, 
        message: 'Event reminder email sent successfully',
        messageId: result.text
      };
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  // Check service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      service: 'EmailJS with Gmail',
      features: [
        'Event registration emails',
        'Welcome emails',
        'Custom emails',
        'Event reminders',
        'No server required'
      ],
      limitations: [
        'Requires EmailJS account setup',
        'Limited to 200 emails/month (free tier)',
        'Templates must be created in EmailJS dashboard'
      ]
    };
  }

  // Test email service
  async testEmail() {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const result = await this.sendEventRegistrationEmail(
        { name: 'Test User', email: 'test@example.com' },
        { 
          title: 'Test Event', 
          startAt: { seconds: Date.now()/1000 },
          location: 'Test Location',
          description: 'This is a test event for email service setup'
        }
      );

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
export const emailService = new EmailService();

// Export individual functions for convenience
export const {
  init,
  sendEventRegistrationEmail,
  sendWelcomeEmail,
  sendCustomEmail,
  sendEventReminder,
  getStatus,
  testEmail
} = emailService;

// Export the service instance for advanced usage
export default emailService;
