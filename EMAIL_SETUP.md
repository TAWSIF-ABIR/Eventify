# Email Setup Guide for Eventify

This guide will help you set up email confirmation for user registration and unregistration in your Eventify application.

## What's Been Added

✅ **User Registration Email** - Automatically sends a welcome email when a user signs up
✅ **User Unregistration Email** - Automatically sends a confirmation email when a user account is deleted
✅ **Event Registration Email** - Already existed, sends confirmation when users register for events

## Step 1: Configure Email Credentials

### For Gmail (Recommended for testing):

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the generated password

3. **Set Firebase configuration**:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com"
   firebase functions:config:set email.password="your-app-password"
   ```

### For Other Email Services:

Update the `emailConfig` in `functions/index.js`:
```javascript
const emailConfig = {
  service: 'outlook', // or 'yahoo', 'sendgrid', etc.
  auth: {
    user: functions.config().email?.user || 'your-email@outlook.com',
    pass: functions.config().email?.password || 'your-password'
  }
};
```

## Step 2: Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

## Step 3: Test the Setup

1. **Create a new user account** - You should receive a welcome email
2. **Delete a user account** - You should receive a deletion confirmation email
3. **Register for an event** - You should receive an event registration email

## How It Works

### User Registration Flow:
1. User signs up through your app
2. Firebase Auth creates the user
3. `sendUserRegistrationEmail` Cloud Function triggers automatically
4. Welcome email is sent to the user
5. User document is created/updated in Firestore

### User Unregistration Flow:
1. User account is deleted (through Firebase Auth or your app)
2. `sendUserUnregistrationEmail` Cloud Function triggers automatically
3. Goodbye email is sent to the user's email address

### Event Registration Flow:
1. User registers for an event
2. Registration document is created in Firestore
3. `sendEventRegistrationEmail` Cloud Function triggers automatically
4. Event confirmation email is sent to the user

## Email Templates

The emails include:
- **Professional HTML design** with your branding
- **Plain text fallback** for email clients that don't support HTML
- **Responsive design** that works on mobile and desktop
- **Personalized content** with user's name and details
- **Clear call-to-action** buttons and links

## Customization

You can customize the email templates by editing:
- `createUserRegistrationTemplate()` - Welcome email design
- `createUserUnregistrationTemplate()` - Goodbye email design
- `createEmailTemplate()` - Event registration email design

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error**:
   - Check your email credentials
   - Ensure 2FA is enabled for Gmail
   - Verify the app password is correct

2. **Emails not sending**:
   - Check Firebase Functions logs: `firebase functions:log`
   - Verify email configuration is set correctly
   - Check if your email service allows SMTP access

3. **Emails going to spam**:
   - Add SPF and DKIM records to your domain
   - Use a professional "from" address
   - Avoid spam trigger words in subject lines

### Check Function Logs:
```bash
firebase functions:log --only sendUserRegistrationEmail
firebase functions:log --only sendUserUnregistrationEmail
```

## Security Notes

- Never commit email credentials to version control
- Use environment variables or Firebase config for sensitive data
- Consider using a dedicated email service (SendGrid, Mailgun) for production
- Implement rate limiting to prevent email abuse

## Next Steps

After setup, you can:
- Customize email templates to match your brand
- Add more email triggers (password reset, profile updates, etc.)
- Implement email preferences for users
- Add email analytics and tracking

---

**Need Help?** Check the Firebase Functions documentation or your email service provider's SMTP settings.
