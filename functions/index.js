const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Email configuration
const emailConfig = {
  // You can use Gmail, Outlook, or any SMTP service
  // For Gmail, you'll need to enable 2FA and generate an App Password
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: functions.config().email?.user || 'your-email@gmail.com',
    pass: functions.config().email?.password || 'your-app-password'
  }
};

// Create email transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Email template for user registration confirmation
function createUserRegistrationTemplate(userData) {
  return {
    subject: `Welcome to Eventify, ${userData.displayName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Eventify</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .welcome-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .welcome-box h3 { margin-top: 0; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Eventify!</h1>
            <p>Your account has been successfully created</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.displayName},</h2>
            <p>Welcome to Eventify! We're excited to have you join our community.</p>
            
            <div class="welcome-box">
              <h3>Account Details</h3>
              <p><strong>📧 Email:</strong> ${userData.email}</p>
              <p><strong>👤 Role:</strong> ${userData.role}</p>
              <p><strong>🆔 User ID:</strong> ${userData.uid}</p>
              ${userData.studentId ? `<p><strong>🎓 Student ID:</strong> ${userData.studentId}</p>` : ''}
              ${userData.session ? `<p><strong>📚 Session:</strong> ${userData.session}</p>` : ''}
              <p><strong>📅 Account Created:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>You can now:</p>
            <ul>
              <li>Browse and register for events</li>
              <li>Create your profile</li>
              <li>Connect with other users</li>
              <li>Manage your event registrations</li>
            </ul>
            
            <a href="https://eventify-5e54d.web.app" class="btn">Get Started with Eventify</a>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Eventify</p>
            <p>© 2024 Eventify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Eventify!

Hello ${userData.displayName},

Welcome to Eventify! We're excited to have you join our community.

Account Details:
- Email: ${userData.email}
- Role: ${userData.role}
- User ID: ${userData.uid}
${userData.studentId ? `- Student ID: ${userData.studentId}` : ''}
${userData.session ? `- Session: ${userData.session}` : ''}
- Account Created: ${new Date().toLocaleDateString()}

You can now:
- Browse and register for events
- Create your profile
- Connect with other users
- Manage your event registrations

Get started at: https://eventify-5e54d.web.app

Best regards,
The Eventify Team
    `
  };
}

// Email template for user unregistration confirmation
function createUserUnregistrationTemplate(userData) {
  return {
    subject: `Account Deletion Confirmation - Eventify`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deletion Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ff6b6b; }
          .info-box h3 { margin-top: 0; color: #ff6b6b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Goodbye from Eventify</h1>
            <p>Your account has been successfully deleted</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.displayName},</h2>
            <p>We're sorry to see you go, but we've successfully processed your account deletion request.</p>
            
            <div class="info-box">
              <h3>Account Deletion Details</h3>
              <p><strong>📧 Email:</strong> ${userData.email}</p>
              <p><strong>👤 Name:</strong> ${userData.displayName}</p>
              <p><strong>📅 Deletion Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>What happens next:</p>
            <ul>
              <li>Your personal data has been permanently removed</li>
              <li>All event registrations have been cancelled</li>
              <li>Your profile information has been deleted</li>
              <li>You will no longer receive notifications from Eventify</li>
            </ul>
            
            <p>If you change your mind, you can always create a new account with the same email address.</p>
            
            <p>Thank you for being part of our community. We hope to see you again in the future!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Eventify</p>
            <p>© 2024 Eventify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Account Deletion Confirmation - Eventify

Hello ${userData.displayName},

We're sorry to see you go, but we've successfully processed your account deletion request.

Account Deletion Details:
- Email: ${userData.email}
- Name: ${userData.displayName}
- Deletion Date: ${new Date().toLocaleDateString()}

What happens next:
- Your personal data has been permanently removed
- All event registrations have been cancelled
- Your profile information has been deleted
- You will no longer receive notifications from Eventify

If you change your mind, you can always create a new account with the same email address.

Thank you for being part of our community. We hope to see you again in the future!

Best regards,
The Eventify Team
    `
  };
}

// Email template for event registration confirmation
function createEmailTemplate(userData, eventData) {
  const startDate = new Date(eventData.startAt.seconds * 1000);
  const endDate = new Date(eventData.endAt.seconds * 1000);
  
  return {
    subject: `Event Registration Confirmation - ${eventData.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .event-details h3 { margin-top: 0; color: #667eea; }
          .event-details p { margin: 8px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Event Registration Confirmed!</h1>
            <p>Thank you for registering with Eventify</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.name},</h2>
            <p>Your registration for <strong>${eventData.title}</strong> has been confirmed!</p>
            
            <div class="event-details">
              <h3>Event Details</h3>
              <p><strong>📅 Date:</strong> ${startDate.toLocaleDateString()}</p>
              <p><strong>⏰ Time:</strong> ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}</p>
              <p><strong>📍 Location:</strong> ${eventData.location || 'TBD'}</p>
              <p><strong>🏷️ Category:</strong> ${eventData.category || 'General'}</p>
              <p><strong>📝 Description:</strong> ${eventData.description || 'No description available'}</p>
            </div>
            
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <p>We look forward to seeing you at the event! If you have any questions, please don't hesitate to contact us.</p>
            
            <a href="https://eventify-5e54d.web.app" class="btn">Visit Eventify</a>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Eventify</p>
            <p>© 2024 Eventify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Event Registration Confirmation - ${eventData.title}

Hello ${userData.name},

Your registration for ${eventData.title} has been confirmed!

Event Details:
- Date: ${startDate.toLocaleDateString()}
- Time: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}
- Location: ${eventData.location || 'TBD'}
- Category: ${eventData.category || 'General'}
- Description: ${eventData.description || 'No description available'}

Registration Date: ${new Date().toLocaleDateString()}

We look forward to seeing you at the event!

Best regards,
The Eventify Team

Visit us at: https://eventify-5e54d.web.app
    `
  };
}

// Cloud Function: Send event registration confirmation email
exports.sendEventRegistrationEmail = functions.firestore
  .document('users/{userId}/registrations/{eventId}')
  .onCreate(async (snap, context) => {
    try {
      const registrationData = snap.data();
      const { userId, eventId } = context.params;
      
      console.log(`New registration: User ${userId} for Event ${eventId}`);
      
      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.error('User document not found:', userId);
        return null;
      }
      const userData = userDoc.data();
      
      // Get event data
      const eventDoc = await admin.firestore().collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        console.error('Event document not found:', eventId);
        return null;
      }
      const eventData = eventDoc.data();
      
      // Create email content
      const emailContent = createEmailTemplate(userData, eventData);
      
      // Send email
      const mailOptions = {
        from: `"Eventify" <${emailConfig.auth.user}>`,
        to: userData.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      
      // Update the registration document with email status
      await snap.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailMessageId: result.messageId
      });
      
      return result;
      
    } catch (error) {
      console.error('Error sending registration email:', error);
      
      // Update the registration document with error status
      try {
        await snap.ref.update({
          emailSent: false,
          emailError: error.message,
          emailErrorAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating registration with email status:', updateError);
      }
      
      return null;
    }
  });

// Cloud Function: Send event reminder emails (optional)
exports.sendEventReminderEmails = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const oneHourFromNow = new Date(now.toMillis() + 60 * 60 * 1000);
      
      // Get events starting in the next hour
      const eventsSnapshot = await admin.firestore()
        .collection('events')
        .where('startAt', '>', now)
        .where('startAt', '<=', admin.firestore.Timestamp.fromDate(oneHourFromNow))
        .get();
      
      const reminderPromises = [];
      
      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        
        // Get all attendees for this event
        const attendeesSnapshot = await admin.firestore()
          .collection('events')
          .doc(eventDoc.id)
          .collection('attendees')
          .get();
        
        for (const attendeeDoc of attendeesSnapshot.docs) {
          const attendeeData = attendeeDoc.data();
          
          // Get user data
          const userDoc = await admin.firestore()
            .collection('users')
            .doc(attendeeData.userId)
            .get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Send reminder email
            const reminderEmail = createReminderEmail(userData, eventData);
            const mailOptions = {
              from: `"Eventify" <${emailConfig.auth.user}>`,
              to: userData.email,
              subject: reminderEmail.subject,
              html: reminderEmail.html,
              text: reminderEmail.text
            };
            
            reminderPromises.push(transporter.sendMail(mailOptions));
          }
        }
      }
      
      if (reminderPromises.length > 0) {
        const results = await Promise.allSettled(reminderPromises);
        console.log(`Sent ${reminderPromises.length} reminder emails`);
        return results;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error sending reminder emails:', error);
      return null;
    }
  });

// Helper function to create reminder email
function createReminderEmail(userData, eventData) {
  const startDate = new Date(eventData.startAt.seconds * 1000);
  
  return {
    subject: `Reminder: ${eventData.title} starts in 1 hour`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Event Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Event Reminder</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.name},</h2>
            <p><strong>${eventData.title}</strong> starts in 1 hour!</p>
            
            <p><strong>Time:</strong> ${startDate.toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${eventData.location || 'TBD'}</p>
            
            <p>Don't forget to attend!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Event Reminder

Hello ${userData.name},

${eventData.title} starts in 1 hour!

Time: ${startDate.toLocaleTimeString()}
Location: ${eventData.location || 'TBD'}

Don't forget to attend!

Best regards,
The Eventify Team
    `
  };
}

// Cloud Function: Send user registration confirmation email
exports.sendUserRegistrationEmail = functions.auth.user().onCreate(async (user) => {
  try {
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: 'user', // Default role
      createdAt: user.metadata.createdAt,
      studentId: null, // Placeholder, will be updated if available
      session: null // Placeholder, will be updated if available
    };

    // Update user document with registration details
    await admin.firestore().collection('users').doc(user.uid).set(userData, { merge: true });

    const emailContent = createUserRegistrationTemplate(userData);

    const mailOptions = {
      from: `"Eventify" <${emailConfig.auth.user}>`,
      to: userData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('User registration email sent successfully:', result.messageId);

    return result;
  } catch (error) {
    console.error('Error sending user registration email:', error);
    return null;
  }
});

// Cloud Function: Send user unregistration confirmation email
exports.sendUserUnregistrationEmail = functions.auth.user().onDelete(async (user) => {
  try {
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      unregisteredAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const emailContent = createUserUnregistrationTemplate(userData);

    const mailOptions = {
      from: `"Eventify" <${emailConfig.auth.user}>`,
      to: userData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('User unregistration email sent successfully:', result.messageId);

    return result;
  } catch (error) {
    console.error('Error sending user unregistration email:', error);
    return null;
  }
});

// Export functions for testing
module.exports = {
  sendEventRegistrationEmail: exports.sendEventRegistrationEmail,
  sendEventReminderEmails: exports.sendEventReminderEmails,
  sendUserRegistrationEmail: exports.sendUserRegistrationEmail,
  sendUserUnregistrationEmail: exports.sendUserUnregistrationEmail
};
