export default {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DB_URL: process.env.DB_URL || "",
  ENDPOINT_URL: process.env.ENDPOINT_URL || "",
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || "",
  IS_DEV: process.env.DEV === 'true' || false,
  DEFAULT_LANGUAGE_CODE: 'en',
  CALLBACK_JOIN: '#',
  LANGUAGES_IN_ROW: 2
}