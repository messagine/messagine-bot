export default {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  ENDPOINT_URL: process.env.ENDPOINT_URL || "",
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || "",
  IS_DEV: process.env.DEV === 'true' || false,
  IS_WEBHOOK: process.env.IS_WEBHOOK === 'true' || false
}