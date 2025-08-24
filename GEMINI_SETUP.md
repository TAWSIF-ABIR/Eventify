# Gemini API Setup for Eventify AI FAQ Chat

## Overview
The Eventify platform now includes an AI-powered FAQ chat system that can answer questions about events, the platform, and university activities using Google's latest **Gemini 2.0 Flash** AI model.

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key
1. Open `index.html`
2. Find the line: `const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';`
3. Replace `'YOUR_GEMINI_API_KEY'` with your actual API key
4. Save the file

### 3. API Configuration
The current configuration uses:
- **Model**: `gemini-2.0-flash` (latest generation model)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Headers**: Includes both `Content-Type` and `X-goog-api-key`
- **Rate Limit**: Follows Google's standard API limits

## Enhanced Features

### AI Chat Capabilities
- **Event Information**: Questions about event registration, types, creation
- **Platform Features**: Navigation, user accounts, dashboard features
- **University Activities**: Club information, campus events, student life
- **General Support**: Platform usage, troubleshooting, best practices
- **Context Awareness**: Remembers conversation history for better responses

### Advanced API Integration
- **Full Context Communication**: Sends conversation history for context-aware responses
- **Safety Settings**: Built-in content filtering and safety measures
- **Generation Config**: Optimized parameters for quality responses
- **Error Handling**: Comprehensive error handling and fallback system
- **Real-time Status**: Live API connection monitoring

### Fallback System
- Works offline with pre-programmed responses
- Handles common questions without API calls
- Graceful degradation when API is unavailable
- Smart pattern matching for offline responses

### User Experience
- Real-time chat interface with typing indicators
- Quick question buttons for common topics
- Responsive design for all devices
- Chat history tracking and management
- Debug panel for development and monitoring

## Technical Implementation

### API Request Structure
```javascript
{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "System prompt with context and user question"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  },
  "safetySettings": [
    // Content safety configurations
  ]
}
```

### Context Building
- Maintains conversation history (last 5 messages)
- Includes system prompt with Eventify platform knowledge
- Provides context-aware responses
- Handles multi-turn conversations

### Error Handling
- Network error detection
- API response validation
- Graceful fallback to offline responses
- Comprehensive logging and debugging

## Security Considerations

### API Key Protection
- **Never commit API keys to version control**
- Consider using environment variables for production
- Monitor API usage and costs
- Implement rate limiting if needed

### Content Safety
- Gemini API includes built-in content filtering
- Responses are monitored for inappropriate content
- User input is sanitized to prevent XSS attacks
- Safety settings configured for educational content

### Data Privacy
- Chat history stored locally in browser
- No persistent storage of conversations
- API requests include minimal necessary data
- User privacy maintained throughout interactions

## Customization

### Response Style
Modify the prompt in `buildConversationContext()` function to change:
- Tone and personality
- Response length and detail level
- Specific knowledge areas
- Language preferences

### Fallback Responses
Update `getFallbackResponse()` function to:
- Add more question patterns
- Customize offline responses
- Include platform-specific information
- Handle edge cases

### UI Styling
The chat interface uses Tailwind CSS classes that can be modified to:
- Change colors and themes
- Adjust layout and spacing
- Modify animations and transitions
- Customize chat bubble styles

## Debug and Monitoring

### Debug Panel
- **API Status**: Real-time connection monitoring
- **Model Information**: Current AI model being used
- **Chat History**: Message count and management
- **Clear Chat**: Reset conversation history

### Console Logging
- API request/response logging
- Error tracking and debugging
- Connection status updates
- Performance monitoring

### Network Monitoring
- API call tracking in browser dev tools
- Response time monitoring
- Error rate tracking
- Usage pattern analysis

## Troubleshooting

### Common Issues
1. **API Key Invalid**: Check key format and permissions
2. **Rate Limiting**: Implement delays between requests
3. **Network Errors**: Check internet connection and firewall settings
4. **Response Format**: Verify API response structure
5. **CORS Issues**: Check browser console for cross-origin errors

### Debug Mode
Enable console logging by checking:
- Browser developer tools
- Network tab for API calls
- Console for error messages
- Debug panel for real-time status

### API Testing
- Connection test runs on page load
- Manual testing with debug panel
- Error simulation and handling
- Performance benchmarking

## Cost Considerations
- Gemini API pricing: [Google AI Pricing](https://ai.google.dev/pricing)
- Monitor usage in Google Cloud Console
- Consider implementing usage limits
- Free tier available for testing
- Cost optimization strategies

## Future Enhancements
- **Multi-language Support**: Add language detection and translation
- **Voice Integration**: Speech-to-text and text-to-speech
- **Advanced Context**: Long-term memory and user preferences
- **Analytics Dashboard**: Question patterns and user engagement
- **Integration**: Connect with other platform features
- **Custom Models**: Fine-tuned responses for specific use cases

## Support
For technical issues:
1. Check browser console for errors
2. Verify API key configuration
3. Test API connectivity
4. Review Google AI documentation
5. Use debug panel for diagnostics

For platform-specific questions:
- Check the Eventify documentation
- Review the codebase structure
- Test with different user scenarios
- Monitor API performance metrics

## API Reference
- **Gemini 2.0 Flash**: [Model Documentation](https://ai.google.dev/models/gemini)
- **API Endpoints**: [REST API Reference](https://ai.google.dev/api/rest)
- **Safety Settings**: [Content Safety Guide](https://ai.google.dev/docs/safety_setting_guide)
- **Best Practices**: [API Usage Guidelines](https://ai.google.dev/docs/best_practices)

