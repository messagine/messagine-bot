export default {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DB_URL: process.env.DB_URL || '',
  DEFAULT_LANGUAGE_CODE: 'en',
  ENDPOINT_URL: process.env.ENDPOINT_URL || '',
  IS_DEV: process.env.DEV === 'true' || false,
  MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '',
};
