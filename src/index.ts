// tslint:disable-next-line: no-var-requires
require('dotenv').config()

import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from './DataHandler';
import { IChat } from './models/Chat';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const dataHandler = new DataHandler();
dataHandler.connect()

bot.onText(/\/find_chat/, async (msg) => {
  const chatId = msg.chat.id;
  const lobby = await dataHandler.findLobby(chatId);
  if (lobby) {
    await bot.sendMessage(chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');
    return;
  }

  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    await closeExistingChat(existingChat, chatId);
  }

  const opponent = await dataHandler.findOpponentInLobby(chatId);

  if (opponent) {
    await dataHandler.leaveLobby(chatId);
    await dataHandler.leaveLobby(opponent.chatId);
    await dataHandler.createChat(chatId, opponent.chatId);
    const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';
    await bot.sendMessage(chatId, chatStartMessage);
    await bot.sendMessage(opponent.chatId, chatStartMessage);
  } else {
    await dataHandler.addToLobby(chatId);
    await bot.sendMessage(chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');
  }
});

bot.onText(/\/exit_chat/, async (msg) => {
  const chatId = msg.chat.id;
  await exitChat(chatId);
});

async function exitChat(chatId: number) {
  const existingChat = await dataHandler.findExistingChat(chatId);

  if (existingChat) {
    await closeExistingChat(existingChat, chatId);
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist.');
  }
}

async function closeExistingChat(existingChat: IChat, closedByUserId: number) {
  const opponentChatIds = getOpponentChatIds(existingChat, closedByUserId);
  opponentChatIds.forEach(async opponentChatId => {
    await bot.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.');
  });
  await bot.sendMessage(closedByUserId, 'You have closed the conversation.')
  await dataHandler.deleteChat(existingChat.id);
}

bot.onText(/\/cancel_find/, async (msg) => {
  const chatId = msg.chat.id;
  await dataHandler.leaveLobby(chatId);
  await bot.sendMessage(chatId, 'Find chat cancelled. To find new chat, type /find_chat command.');
});

function isBotCommand(message: TelegramBot.Message): boolean {
  return message.entities && message.entities.length === 1 && message.entities[0].type === 'bot_command';
}

function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

bot.on('text', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => { await bot.sendMessage(opponentChatId, msg.text); });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});