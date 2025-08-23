# Eventify Firebase Deployment Guide

## 🚀 Live Application

Your Eventify application is now deployed at: **https://eventify-5e54d.web.app**

## 📋 What's Deployed

### ✅ Firebase Services
- **Firebase Hosting** - Static web application
- **Firebase Authentication** - User login/signup
- **Firestore Database** - Data storage (no Storage for images)

### ✅ Database Collections
- `users` - User profiles and authentication data
- `events` - Event information and details
- `rooms` - Venue and room management
- `registrations` - Event registrations (subcollection)
- `attendees` - Event attendees (subcollection)
- `certificates` - Generated certificates

## 🔧 Setup Instructions

### 1. Initialize Database
Visit: **https://eventify-5e54d.web.app/setup-database.html**

This will create:
- Admin user: `admin@eventify.com` (password: `password123`)
- Student user: `student@eventify.com` (password: `password123`)
- Sample rooms and events

### 2. Login Credentials
- **Admin Login**: `admin@eventify.com` / `password123`
- **Student Login**: `student@eventify.com` / `password123`

## 🛠️ Development Commands

### Deploy to Firebase
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### Local Development
```bash
# Install dependencies
npm install

# Build CSS
npm run build

# Start development server
npm run dev
```

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: "student" | "admin",
  studentId: string,
  session: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Events Collection
```javascript
{
  title: string,
  description: string,
  category: string,
  location: string,
  startAt: timestamp,
  endAt: timestamp,
  deadline: timestamp,
  capacity: number,
  attendeeCount: number,
  visibility: "public" | "draft",
  status: "upcoming" | "ongoing" | "completed",
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Rooms Collection
```javascript
{
  name: string,
  capacity: number,
  building: string,
  floor: number,
  facilities: array,
  isAvailable: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔒 Security Rules

Firestore security rules are configured to:
- Allow users to read/write their own data
- Allow admins to read all user data
- Allow authenticated users to read events
- Allow only admins to create/edit events

## 🎯 Features Available

### For Students
- Browse and search events
- Register for events
- View registration history
- Update profile information

### For Admins
- Create and manage events
- View event analytics
- Manage room bookings
- View all user registrations

## 🚨 Important Notes

1. **No Image Upload**: Firebase Storage is not configured, so event posters and user avatars are not supported
2. **Authentication Required**: All features require user authentication
3. **Admin Access**: Only users with `role: "admin"` can create events and access admin features

## 🔧 Troubleshooting

### Common Issues
1. **Authentication Errors**: Make sure you're using the correct email/password
2. **Permission Denied**: Check if you have the correct role for the action
3. **Database Connection**: Ensure Firestore is enabled in your Firebase project

### Firebase Console
Access your Firebase project at: https://console.firebase.google.com/project/eventify-5e54d

## 📞 Support

For issues or questions:
1. Check the Firebase Console for error logs
2. Review the browser console for JavaScript errors
3. Verify your Firebase configuration in `js/firebase-init.js`
