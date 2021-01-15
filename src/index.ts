require('dotenv').config()

import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Received your message');
});