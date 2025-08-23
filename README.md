# 🎉 Eventify - University Club Event Management Platform

A modern, responsive web application for managing university club events with Firebase backend integration.

## 🌟 Live Demo

**Live Application:** https://eventify-5e54d.web.app

## ✨ Features

### 🎯 Core Features
- **Event Management**: Create, edit, and manage university club events
- **User Authentication**: Secure login/signup with Firebase Auth
- **Role-Based Access**: Admin and Student dashboards
- **Real-time Updates**: Live event data with Firestore
- **Responsive Design**: Works perfectly on all devices

### 👨‍💼 Admin Features
- Create and manage events
- View event statistics and analytics
- Manage event registrations
- Generate certificates for attendees
- Room and venue management

### 👨‍🎓 Student Features
- Browse and search events
- Register for events
- View personal event history
- Download participation certificates
- Profile management

### 🎨 UI/UX Features
- Modern, dark-themed interface
- Smooth animations and transitions
- Mobile-first responsive design
- Intuitive navigation
- Real-time loading states

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Tailwind CSS
- **JavaScript (ES6+)** - Modern JavaScript features
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Services
- **Firebase Authentication** - User management
- **Firestore Database** - NoSQL document database
- **Firebase Hosting** - Static web hosting
- **Firebase Security Rules** - Database security

### Development Tools
- **Firebase CLI** - Development and deployment
- **Git** - Version control
- **VS Code** - Code editor (recommended)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventify.git
   cd eventify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   ```bash
   firebase login
   firebase init
   ```

4. **Configure Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update `js/firebase-init.js` with your config

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## 📁 Project Structure

```
eventify/
├── index.html              # Home page
├── auth-new.html           # Authentication page
├── admin-dashboard.html    # Admin dashboard
├── dashboard.html          # Student dashboard
├── events.html             # Events listing page
├── create-event.html       # Event creation form
├── event.html              # Individual event details
├── js/                     # JavaScript modules
│   ├── firebase-init.js    # Firebase configuration
│   ├── auth.js            # Authentication logic
│   ├── db.js              # Database operations
│   └── pages/             # Page-specific scripts
├── styles/                 # CSS files
│   ├── tailwind.css       # Tailwind source
│   └── output.css         # Compiled CSS
├── firebase.json           # Firebase configuration
├── firestore.rules         # Database security rules
└── README.md              # This file
```

## 🔐 Authentication

### Default Admin Account
- **Email**: admin@eventify.com
- **Password**: password123

### Student Registration
Students can create accounts through the signup page with:
- Email and password
- Full name
- Student ID
- Academic session

## 🎯 Usage

### For Admins
1. Login with admin credentials
2. Access admin dashboard
3. Create new events with details
4. Manage existing events
5. View analytics and statistics

### For Students
1. Register or login
2. Browse available events
3. Register for events
4. View personal dashboard
5. Download certificates

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Update the Firebase config in `js/firebase-init.js`
4. Deploy security rules and indexes

### Customization
- Modify `styles/tailwind.css` for theme changes
- Update Firebase security rules in `firestore.rules`
- Customize event categories and features

## 📊 Database Schema

### Collections
- **users**: User profiles and authentication data
- **events**: Event information and details
- **registrations**: Event registration records
- **attendees**: Event attendance tracking
- **certificates**: Generated certificates
- **rooms**: Venue and room information

## 🚀 Deployment

### Firebase Hosting
```bash
firebase deploy --only hosting
```

### Manual Deployment
1. Build the project: `npm run build`
2. Upload files to your web server
3. Configure Firebase services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Tailwind CSS for styling
- University community for feedback

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: your.email@example.com

---

**Made with ❤️ for university communities**
