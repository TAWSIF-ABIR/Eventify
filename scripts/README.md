# Eventify Firebase Setup Scripts

This directory contains scripts to set up and maintain your Eventify Firebase database.

## 🚀 Adding attendeeCount Field to Events

The `attendeeCount` field is required for the attendee counting system to work properly. This field stores the number of registered attendees for each event.

### Method 1: Using Firebase Console (Recommended for beginners)

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `eventify-5e54d`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Go to the "Data" tab

3. **Update Each Event Document**
   - Find each event document in the `events` collection
   - Click on the document to edit
   - Add a new field:
     - **Field name**: `attendeeCount`
     - **Type**: `number`
     - **Value**: `0` (or the actual count if you know it)
   - Click "Update" to save

4. **Repeat for All Events**
   - Do this for every event document in your collection

### Method 2: Using Firebase CLI Script (Advanced)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Set Project**
   ```bash
   firebase use eventify-5e54d
   ```

4. **Download Service Account Key**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in this directory

5. **Install Dependencies**
   ```bash
   cd scripts
   npm install
   ```

6. **Run the Script**
   ```bash
   node add-attendee-count.js
   ```

7. **Clean Up**
   ```bash
   rm temp-add-attendee-count.js serviceAccountKey.json
   ```

## 🔧 What the attendeeCount Field Does

The `attendeeCount` field is used by the application to:

- **Display accurate attendee counts** on all event cards
- **Update counts in real-time** when users register/unregister
- **Persist counts across page refreshes**
- **Sync data consistently** across all pages
- **Provide real-time updates** to all users

## 📊 Expected Schema

After setup, your event documents should look like this:

```json
{
  "title": "Sample Event",
  "description": "Event description",
  "startAt": "timestamp",
  "endAt": "timestamp",
  "location": "Event location",
  "category": "Event category",
  "visibility": "public",
  "createdBy": "user_uid",
  "attendeeCount": 0,        // ← This field is required
  "capacity": 100,           // Optional
  "imageUrl": "",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 🧪 Testing the Setup

After adding the `attendeeCount` field:

1. **Refresh your application**
2. **Go to the All Events page**
3. **Register for an event**
4. **Check if the count increments**
5. **Refresh the page**
6. **Verify the count persists**

## ❌ Troubleshooting

### Count Still Resets After Refresh
- Make sure the `attendeeCount` field exists in Firebase
- Check that the field type is `number`, not `string`
- Verify the Firestore rules allow updates to this field

### Permission Denied Errors
- Ensure you're logged in to Firebase
- Check that your Firestore rules allow `attendeeCount` updates
- Verify the service account has proper permissions

### Script Errors
- Make sure all dependencies are installed
- Check that the service account key is valid
- Ensure you're in the correct project

## 🔗 Related Files

- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Database indexes
- `firebase.json` - Firebase configuration

## 📞 Support

If you encounter issues:

1. Check the Firebase Console for error messages
2. Verify your Firestore rules are deployed
3. Ensure all required fields exist in your documents
4. Test with a simple event first

---

**Note**: The `attendeeCount` field is essential for the attendee counting system to work properly. Without it, counts will reset on every page refresh.
