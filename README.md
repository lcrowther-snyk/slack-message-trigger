# Slack Message Forwarder

A Slack app that automatically forwards messages from one channel to another in real-time.

## Features

- ✅ Forwards all messages from a source channel to a target channel
- ✅ Includes sender information and source channel context
- ✅ Handles file uploads and attachments
- ✅ Prevents infinite loops by ignoring bot messages
- ✅ Provides health check endpoint for monitoring

## Prerequisites

- Node.js (v16 or higher)
- A Slack workspace where you have permission to create apps
- Public URL for your app (use ngrok for local development)

## Setup Instructions

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Give your app a name (e.g., "Message Forwarder") and select your workspace

### 2. Configure OAuth & Permissions

1. In your app settings, go to "OAuth & Permissions"
2. Add the following Bot Token Scopes:
   - `channels:history` - Read messages from public channels
   - `groups:history` - Read messages from private channels (if needed)
   - `chat:write` - Send messages as the bot
   - `users:read` - Get user information for message formatting
   - `channels:read` - Get channel information

3. Install the app to your workspace and copy the "Bot User OAuth Token"

### 3. Get Channel IDs

To find channel IDs:
1. Right-click on the channel name in Slack
2. Select "Copy link"
3. The channel ID is the part after `/channels/` or `/groups/`
   - Example: `https://your-workspace.slack.com/channels/C1234567890`
   - Channel ID: `C1234567890`

### 4. Configure Event Subscriptions

1. In your app settings, go to "Event Subscriptions"
2. Enable events and set your Request URL to: `https://your-domain.com/slack/events`
3. Subscribe to these bot events:
   - `message.channels` - Listen to messages in public channels
   - `message.groups` - Listen to messages in private channels (if needed)

4. Save changes and reinstall your app when prompted

### 5. Environment Setup

1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Edit `.env` with your actual values:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
   SLACK_SIGNING_SECRET=your-actual-signing-secret
   SOURCE_CHANNEL_ID=C1234567890
   TARGET_CHANNEL_ID=C0987654321
   PORT=3000
   ```

### 6. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Or run in production mode
npm start
```

### 7. Expose Your Local App (for development)

If testing locally, use ngrok to expose your app:

```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

Copy the HTTPS URL from ngrok and use it as your Request URL in Slack Event Subscriptions.

## Usage

1. Invite the bot to both the source and target channels:
   ```
   /invite @your-bot-name
   ```

2. The bot will automatically forward any new messages from the source channel to the target channel

3. Messages will be formatted like:
   ```
   *Message from #source-channel:*
   *John Doe:* Hello, this is a test message!
   ```

## Health Check

The app provides a health check endpoint at `/health` that returns:
```json
{
  "status": "OK",
  "message": "Slack Message Forwarder is running"
}
```

## Security Considerations

- Store your tokens securely and never commit them to version control
- Use HTTPS for your webhook URL in production
- Consider implementing additional validation for webhook requests
- Monitor the app's logs for any suspicious activity

## Troubleshooting

### Common Issues

1. **Messages not being forwarded**
   - Check that the bot is invited to both channels
   - Verify channel IDs are correct
   - Check app logs for errors

2. **"URL verification failed"**
   - Ensure your server is running and accessible
   - Check that the ngrok URL is correctly set in Event Subscriptions
   - Verify the signing secret is correct

3. **Permission errors**
   - Make sure all required OAuth scopes are added
   - Reinstall the app after adding new scopes

## Development

To add new features or modify the forwarding logic, edit `app.js`. The main message handling is in the `app.message()` event handlers.

## License

MIT 