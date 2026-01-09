import * as Sentry from '@sentry/node';
import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from './config';
import { bot, chatReminderJob, createChatJob, setupBot, syncCommands, syncWebhook, webhook } from './lib/telegram';

// Initialize Sentry for error tracking (if DSN is configured)
if (config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    tracesSampleRate: 1.0,
  });
  console.log('Sentry initialized');
}

const app = express();
app.use(express.json());

// Add Sentry request handler (must be first middleware)
if (config.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// Initialize bot middleware/commands
setupBot();

// Sync webhook and commands with Telegram
(async () => {
    try {
        await syncWebhook();
        await syncCommands();
        console.log('Webhook and commands synced successfully');
    } catch (error) {
        console.error('Failed to sync webhook/commands:', error);
    }
})();

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (_, res) => {
    res.send('Messagine Bot is running');
});

// Detailed health check with database status
app.get('/health', async (_, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            uptime: process.uptime(),
        };

        if (dbStatus === 'disconnected') {
            return res.status(503).json({
                ...health,
                status: 'unhealthy',
            });
        }

        return res.status(200).json(health);
    } catch (error) {
        return res.status(503).json({
            status: 'error',
            error: 'Health check failed',
        });
    }
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
        if (config.SENTRY_DSN) {
            Sentry.captureException(error);
        }
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
        if (config.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { job: 'createChat' },
            });
        }
    }
});

cron.schedule(chatReminderSchedule, async () => {
    console.log('Running chatReminderJob...');
    try {
        await chatReminderJob();
        console.log('chatReminderJob completed');
    } catch (error) {
        console.error('chatReminderJob failed:', error);
        if (config.SENTRY_DSN) {
            Sentry.captureException(error, {
                tags: { job: 'chatReminder' },
            });
        }
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Webhook endpoint: ${webhookPath}`);
    console.log(`Create Chat Schedule: ${createChatSchedule}`);
    console.log(`Chat Reminder Schedule: ${chatReminderSchedule}`);
});

// Graceful shutdown handlers
async function gracefulShutdown(signal: string) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Close HTTP server first (stop accepting new connections)
    server.close(() => {
        console.log('HTTP server closed');
    });

    try {
        // Stop the Telegram bot
        if (bot) {
            await bot.stop();
            console.log('Telegram bot stopped');
        }

        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('Database connection closed');
        }

        // Flush Sentry events
        if (config.SENTRY_DSN) {
            await Sentry.close(2000);
            console.log('Sentry flushed');
        }

        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        if (config.SENTRY_DSN) {
            Sentry.captureException(error);
        }
        process.exit(1);
    }
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (config.SENTRY_DSN) {
        Sentry.captureException(error);
    }
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (config.SENTRY_DSN) {
        Sentry.captureException(reason);
    }
});
