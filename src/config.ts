export default {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DB_URL: process.env.DB_URL || '',
  DEFAULT_LANGUAGE_CODE: 'en',
  DEFAULT_LANGUAGE_NAME: 'English',
  ENDPOINT_URL: process.env.ENDPOINT_URL || '',
  IS_DEV: process.env.DEV === 'true' || false,
  MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN || '',
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '',
};
