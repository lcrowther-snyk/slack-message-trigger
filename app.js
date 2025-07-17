const { App } = require('@slack/bolt');
require('dotenv').config();

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false, // We'll use HTTP mode for webhooks
  appToken: process.env.SLACK_APP_TOKEN, // Only needed for Socket Mode
});

// Configuration for source and target channels
const SOURCE_CHANNEL_ID = process.env.SOURCE_CHANNEL_ID;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

// Listen for message events in the source channel
app.message(async ({ message, client, logger }) => {
  try {
    // Check if the message is from the source channel we want to monitor
    if (message.channel !== SOURCE_CHANNEL_ID) {
      return; // Ignore messages from other channels
    }

    // Ignore bot messages to prevent infinite loops
    if (message.bot_id || message.subtype === 'bot_message') {
      logger.info('Ignoring bot message to prevent loops');
      return;
    }

    // Get user info for better formatting
    const userInfo = await client.users.info({
      user: message.user
    });

    // Get channel info for better context
    const channelInfo = await client.conversations.info({
      channel: SOURCE_CHANNEL_ID
    });

    // Format the forwarded message
    const forwardedText = `*Message from #${channelInfo.channel.name}:*\n` +
                         `*${userInfo.user.real_name || userInfo.user.name}:* ${message.text}`;

    // Forward the message to the target channel
    const result = await client.chat.postMessage({
      channel: TARGET_CHANNEL_ID,
      text: forwardedText,
      unfurl_links: false,
      unfurl_media: false
    });

    logger.info(`Message forwarded successfully: ${result.ts}`);
    
  } catch (error) {
    logger.error('Error forwarding message:', error);
  }
});

// Handle file uploads and attachments
app.message(async ({ message, client, logger }) => {
  try {
    // Only process messages from the source channel
    if (message.channel !== SOURCE_CHANNEL_ID) {
      return;
    }

    // Ignore bot messages
    if (message.bot_id || message.subtype === 'bot_message') {
      return;
    }

    // Check if message has files
    if (message.files && message.files.length > 0) {
      const userInfo = await client.users.info({
        user: message.user
      });

      const channelInfo = await client.conversations.info({
        channel: SOURCE_CHANNEL_ID
      });

      // Forward file information
      for (const file of message.files) {
        const fileText = `*File shared in #${channelInfo.channel.name} by ${userInfo.user.real_name || userInfo.user.name}:*\n` +
                        `📎 *${file.name}* (${file.filetype})\n` +
                        `${file.permalink}`;

        await client.chat.postMessage({
          channel: TARGET_CHANNEL_ID,
          text: fileText,
          unfurl_links: true
        });
      }

      logger.info('File(s) forwarded successfully');
    }
  } catch (error) {
    logger.error('Error forwarding file:', error);
  }
});

// Health check endpoint
app.receiver.app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Slack Message Forwarder is running' });
});

// Error handling
app.error(async (error) => {
  console.error('App error:', error);
});

// Start your app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Slack Message Forwarder is running on port ${port}!`);
  console.log(`📤 Forwarding messages from channel: ${SOURCE_CHANNEL_ID}`);
  console.log(`📥 To target channel: ${TARGET_CHANNEL_ID}`);
})(); 