#!/bin/bash

# Eventify Firebase Cloud Functions Deployment Script
# This script helps deploy the email confirmation functions

echo "🚀 Eventify Firebase Functions Deployment"
echo "========================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI found"
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

# Check if functions directory exists
if [ ! -d "functions" ]; then
    echo "❌ Functions directory not found. Please run 'firebase init functions' first."
    exit 1
fi

# Install dependencies
echo "📦 Installing function dependencies..."
cd functions
npm install
cd ..

# Set email configuration (prompt user)
echo ""
echo "📧 Email Configuration Setup"
echo "============================"
read -p "Enter your email address: " email_user
read -s -p "Enter your email password/app password: " email_password
echo ""

# Set Firebase config
echo "⚙️ Setting Firebase configuration..."
firebase functions:config:set email.user="$email_user"
firebase functions:config:set email.password="$email_password"

# Deploy functions
echo "🚀 Deploying Cloud Functions..."
firebase deploy --only functions

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test email confirmation by registering for an event"
echo "2. Check Firebase Console > Functions for logs"
echo "3. Monitor email delivery status in Firestore"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check function logs: firebase functions:log"
echo "- View config: firebase functions:config:get"
echo "- Test locally: firebase emulators:start --only functions"
