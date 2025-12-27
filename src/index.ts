
import express from 'express';
import cron from 'node-cron';
import config from './config';
import { chatReminderJob, createChatJob, setupBot, webhook } from './lib/telegram';

const app = express();
app.use(express.json());

// Initialize bot middleware/commands
setupBot();

const PORT = process.env.PORT || 3000;

// Health check
app.get('/', (_, res) => {
    res.send('Messagine Bot is running');
});

// Webhook handler
const webhookPath = config.WEBHOOK_PATH ? (config.WEBHOOK_PATH.startsWith('/') ? config.WEBHOOK_PATH : `/${config.WEBHOOK_PATH}`) : '/api';
app.post(webhookPath, async (req, res) => {
    try {
        // The previous handler passed 'event', where event.body was a string. 
        // Express with express.json() parses body to object.
        // The webhook function in telegram.ts expects 'event'. 
        // In handler.ts: webhook(event) -> const body = JSON.parse(event.body);
        // So we need to mock the event structure or refactor telegram.ts.
        // Minimally invasive: mock the structure.
        const event = {
            body: JSON.stringify(req.body)
        };
        await webhook(event);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error');
    }
});

// Scheduled Jobs
// Defaults derived from typical bot behaviors, usually customizable via ENV
const createChatSchedule = process.env.CREATE_CHAT_SCHEDULE || '0 10 * * *'; // Default: Daily at 10:00 AM
const chatReminderSchedule = process.env.CHAT_REMINDER_SCHEDULE || '0 18 * * *'; // Default: Daily at 6:00 PM

cron.schedule(createChatSchedule, async () => {
    console.log('Running createChatJob...');
    try {
        await createChatJob();
        console.log('createChatJob completed');
    } catch (error) {
        console.error('createChatJob failed:', error);
    }
});

cron.schedule(chatReminderSchedule, async () => {
    console.log('Running chatReminderJob...');
    try {
        await chatReminderJob();
        console.log('chatReminderJob completed');
    } catch (error) {
        console.error('chatReminderJob failed:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Webhook endpoint: ${webhookPath}`);
    console.log(`Create Chat Schedule: ${createChatSchedule}`);
    console.log(`Chat Reminder Schedule: ${chatReminderSchedule}`);
});
