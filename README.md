# Eventify - University Club Event Management Platform

A modern web application for managing university club events with Firebase backend integration.

## Live Demo

**Live Application:** https://eventify-5e54d.web.app

## What This App Does

Eventify helps university clubs organize and manage events. Students can browse events, register for them, and get certificates. Admins can create events, manage registrations, and track attendance.

## Main Features

### For Everyone
- Browse and search university events
- View event details and schedules
- Modern, mobile-friendly design

### For Admins
- Create and manage events
- View event statistics and analytics
- Manage event registrations
- Generate certificates for attendees
- Room and venue management

### For Students
- Browse and search events
- Register for events
- View personal event history
- Download participation certificates
- Manage profile information

## Technology Used

### Frontend
- HTML5 for structure
- CSS3 with Tailwind CSS for styling
- JavaScript (ES6+) for functionality

### Backend & Services
- Firebase Authentication for user management
- Firestore Database for storing data
- Firebase Hosting for the website
- Firebase Security Rules for database protection

## How to Get Started

### What You Need
- Node.js (version 14 or higher)
- Firebase CLI
- Git

### Setup Steps

1. **Get the code**
   ```
   git clone https://github.com/yourusername/eventify.git
   cd eventify
   ```

2. **Install packages**
   ```
   npm install
   ```

3. **Set up Firebase**
   ```
   firebase login
   firebase init
   ```

4. **Configure Firebase**
   - Create a new Firebase project
   - Turn on Authentication (Email/Password)
   - Turn on Firestore Database
   - Update js/firebase-init.js with your settings

5. **Deploy to Firebase**
   ```
   firebase deploy
   ```

## Project Files

```
eventify/
├── index.html              - Home page
├── auth-new.html           - Login and signup page
├── admin-dashboard.html    - Admin control panel
├── dashboard.html          - Student dashboard
├── events.html             - List of all events
├── create-event.html       - Form to create events
├── event.html              - Individual event page
├── js/                     - JavaScript files
│   ├── firebase-init.js    - Firebase setup
│   ├── auth.js            - User login/logout
│   ├── db.js              - Database operations
│   └── pages/             - Page-specific code
├── styles/                 - CSS files
│   ├── tailwind.css       - Tailwind source
│   └── output.css         - Final CSS
├── firebase.json           - Firebase settings
├── firestore.rules         - Database security
└── README.md              - This file
```

## How to Use

### For Admins
1. Login with admin account
2. Go to admin dashboard
3. Create new events
4. Manage existing events
5. View statistics

### For Students
1. Create account or login
2. Browse events
3. Register for events
4. Check your dashboard
5. Download certificates

## Default Login

### Admin Account
- Email: admin@eventify.com
- Password: password123

### Student Accounts
Students can create their own accounts through the signup page. They need to provide:
- Email and password
- Full name
- Student ID
- Academic session

## Database Structure

The app uses these main collections:
- users: User profiles and login info
- events: Event details and information
- registrations: Who registered for what
- attendees: Who actually attended
- certificates: Generated certificates
- rooms: Venue information

## Customization

### Change the Look
- Edit styles/tailwind.css for colors and themes
- Modify HTML files for layout changes

### Change Security
- Update firestore.rules for database access
- Modify authentication settings in Firebase

## Deploying

### To Firebase Hosting
```
firebase deploy --only hosting
```

### To Other Servers
1. Build the project: npm run build
2. Upload files to your web server
3. Set up Firebase services

## Contributing

1. Fork this repository
2. Create a new branch for your feature
3. Make your changes
4. Test everything works
5. Submit a pull request

## Support

If you need help:
- Create an issue on GitHub
- Check the Firebase documentation
- Contact: your.email@example.com

## License

This project uses the MIT License. You can use, modify, and distribute it freely.

---

Built for university communities to make event management easier and more organized.
