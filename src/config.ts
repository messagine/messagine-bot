function validateRequiredEnvVars() {
  const requiredVars = ['BOT_TOKEN', 'DB_URL', 'ENDPOINT_URL'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please set these variables in your .env file or environment.'
    );
  }
}

validateRequiredEnvVars();

export default {
  BOT_TOKEN: process.env.BOT_TOKEN!,
  DB_URL: process.env.DB_URL!,
  DEFAULT_LANGUAGE_CODE: 'en',
  ENDPOINT_URL: process.env.ENDPOINT_URL!,
  IS_DEV: process.env.DEV === 'true' || false,
  MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN || '',
  NEXT_REMINDER_DAYS: parseInt(process.env.NEXT_REMINDER_DAYS || '1', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '',
};
