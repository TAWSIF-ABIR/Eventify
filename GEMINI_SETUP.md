# Gemini API Setup Guide for Eventify Chatbot

## Getting Your Gemini API Key

1. **Go to Google AI Studio**: Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in with Google**: Use your Google account to access the AI Studio

3. **Create API Key**: Click "Create API Key" to generate a new key

4. **Copy the Key**: Copy the generated API key (it will look like: `AIzaSy...`)

## Configuration

1. **Open `index.html`** in your code editor

2. **Find this line** (around line 600):
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```

3. **Replace with your actual API key**:
   ```javascript
   const GEMINI_API_KEY = 'AIzaSyYourActualKeyHere';
   ```

## Features

The chatbot includes:

- **Floating Button**: Always visible in bottom-right corner
- **Gemini AI Integration**: Uses Google's latest AI model for intelligent responses
- **Fallback Responses**: Rule-based responses if API is unavailable
- **Event-Specific Knowledge**: Trained on Eventify platform information
- **Responsive Design**: Works on all device sizes
- **Smooth Animations**: Professional UI with hover effects

## Common Questions the Bot Can Answer

- How do I register for an event?
- Can I cancel my registration?
- What are the event details?
- How do I log in?
- General Eventify platform questions

## Testing

1. **Without API Key**: The bot will use fallback responses
2. **With API Key**: The bot will use Gemini AI for intelligent responses
3. **Click the floating chat button** to test the functionality

## Security Note

- Never commit your API key to public repositories
- Consider using environment variables for production
- The API key is visible in client-side code (acceptable for demo purposes)

## Troubleshooting

- **Bot not responding**: Check if API key is correctly set
- **API errors**: Verify your API key is valid and has quota
- **Styling issues**: Ensure Tailwind CSS is properly loaded
