require('dotenv').config()

import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import Lobby, { ILobby } from './models/Lobby';
import Chat, { IChat } from './models/Chat';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

bot.onText(/\/find_chat/, async (msg) => {
  const chatId = msg.chat.id;

  await Lobby.deleteOne({ chatId });
  const existingChat = await findExistingChat(chatId);
  if (existingChat) {
    await closeExistingChat(existingChat, chatId);
  }

  const opponent: ILobby = await Lobby.findOne({ chatId: { $ne: chatId } });

  if (opponent) {
    const opponentChatId = opponent.chatId;
    const chatIds = [chatId, opponentChatId]
    await Lobby.deleteOne({ chatId: opponentChatId });
    await Chat.create({chatIds});
    const chatStartMessage = "Chat started. You can exit chat via /exit_chat command. Have fun.";
    chatIds.forEach(async chatId => { await bot.sendMessage(chatId, chatStartMessage); })
  } else {
    await Lobby.create({ chatId });
    await bot.sendMessage(chatId, "Waiting in the lobby. You can exit lobby via /cancel_find command.");
  }
});

bot.onText(/\/exit_chat/, async (msg) => {
  const chatId = msg.chat.id;
  await exitChat(chatId);
});

async function exitChat(chatId: number) {
  const existingChat = await findExistingChat(chatId);

  if (existingChat) {
    await closeExistingChat(existingChat, chatId);
  } else {
    await bot.sendMessage(chatId, "Chat doesn't exist.");
  }
}

function findExistingChat(chatId: number): Promise<IChat> {
  return Chat.findOne({chatIds: chatId});
}

async function closeExistingChat(existingChat: IChat, closedByUserId: number) {
  const opponentChatIds = getOpponentChatIds(existingChat, closedByUserId);
  opponentChatIds.forEach(async opponentChatId => {await bot.sendMessage(opponentChatId, "Conversation closed by opponent. To find new chat, type /find_chat command.");});
  await bot.sendMessage(closedByUserId, "You have closed the conversation.")
  await Chat.findByIdAndDelete(existingChat.id);
}

bot.onText(/\/cancel_find/, async (msg) => {
  const chatId = msg.chat.id;
  await Lobby.deleteOne({ chatId });
  await bot.sendMessage(chatId, "Find chat cancelled. To find new chat, type /find_chat command.");
});

function isBotCommand(message: TelegramBot.Message): boolean {
  return message.entities && message.entities.length == 1 && message.entities[0].type == 'bot_command';
}

function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

bot.on('text', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {await bot.sendMessage(opponentChatId, msg.text);});
  } else {
    await bot.sendMessage(chatId, "Chat doesn't exist. To find new chat, type /find_chat command.");
  }
});