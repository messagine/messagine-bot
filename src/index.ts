// tslint:disable-next-line: no-var-requires
require('dotenv').config()

import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from './DataHandler';
import { IChat } from './models/Chat';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const dataHandler = new DataHandler();
dataHandler.connect();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await dataHandler.getUser(chatId);
  if (user) {
    await bot.sendMessage(chatId, 'Welcome back. To find new chat, type /find_chat command.');
  } else {
    const languageCode = msg.from.language_code;
    await dataHandler.addUser(chatId, languageCode);
    await bot.sendMessage(chatId, `Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${languageCode}, to change your language type /set_language`);
  }
});

bot.onText(/\/set_language/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await dataHandler.getUser(chatId);
  let currentLanguageCode = '';
  if (user && user.languageCode) {
    currentLanguageCode = user.languageCode;
  }

  let retryMessage: string;
  if (currentLanguageCode) {
    retryMessage = `Your language is ${currentLanguageCode}. Type /set_language [lang] (e.g. /set_language en) to change your language.`;
  } else {
    retryMessage = 'Type /set_language [lang] (e.g. /set_language en) to change your language.';
  }
  await bot.sendMessage(chatId, retryMessage);
  return;
});

bot.onText(/\/set_language (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const user = await dataHandler.getUser(chatId);
  let currentLanguageCode = '';
  if (user && user.languageCode) {
    currentLanguageCode = user.languageCode;
  }
  if (match.length !== 2) {
    let retryMessage: string;
    if (currentLanguageCode) {
      retryMessage = `Your language is ${currentLanguageCode}. Type /set_language [lang] (e.g. /set_language en) to change your language.`;
    } else {
      retryMessage = 'Type /set_language [lang] (e.g. /set_language en) to change your language.';
    }
    await bot.sendMessage(chatId, retryMessage);
    return;
  }
  const newLanguageCode = match[1];
  // TODO: check language

  if (newLanguageCode === currentLanguageCode) {
    await bot.sendMessage(chatId, `Your language ${currentLanguageCode} not changed.`);
    return;
  }

  let successMessage: string;
  if (currentLanguageCode) {
    successMessage = `Your language changed from ${currentLanguageCode} to ${newLanguageCode}.`;
  } else {
    successMessage = `Your language set to ${newLanguageCode}.`;
  }

  const successMessagePromise = bot.sendMessage(chatId, successMessage);
  const setLanguagePromise = dataHandler.setLanguage(chatId, newLanguageCode);
  await Promise.all([successMessagePromise, setLanguagePromise]);
});

bot.onText(/\/find_chat/, async (msg) => {
  const chatId = msg.chat.id;
  const lobbyPromise = dataHandler.findLobby(chatId);
  const existingChatPromise = dataHandler.findExistingChat(chatId);
  const userPromise = dataHandler.getUser(chatId);
  const checkResults = await Promise.all([lobbyPromise, existingChatPromise, userPromise]);

  const lobby = checkResults[0];
  if (lobby) {
    await bot.sendMessage(chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');
    return;
  }

  const existingChat = checkResults[1];
  if (existingChat) {
    await bot.sendMessage(chatId, 'You are in an active chat. To exit current chat type /exit_chat and try again.');
    return;
  }

  const user = checkResults[2];
  if (!user || !user.languageCode) {
    await bot.sendMessage(chatId, 'Set your language via /set_language and try again.');
    return;
  }

  const opponent = await dataHandler.findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';

    const leaveCurrentUserLobbyPromise = dataHandler.leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = dataHandler.leaveLobby(opponent.chatId);
    const createChatPromise = dataHandler.createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = bot.sendMessage(chatId, chatStartMessage);
    const chatStartToOpponentUserPromise = bot.sendMessage(opponent.chatId, chatStartMessage);

    await Promise.all([leaveCurrentUserLobbyPromise, leaveOpponentUserLobbyPromise, createChatPromise, chatStartToCurrentUserPromise, chatStartToOpponentUserPromise]);
  } else {
    const addToLobbyPromise = dataHandler.addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = bot.sendMessage(chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');

    await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
});

bot.onText(/\/exit_chat/, async (msg) => {
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);

  if (existingChat) {
    await closeExistingChat(existingChat, chatId);
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist.');
  }
});

async function closeExistingChat(existingChat: IChat, closedByUserId: number) {
  const opponentChatIds = getOpponentChatIds(existingChat, closedByUserId);
  const sendMessagePromise = bot.sendMessage(closedByUserId, 'You have closed the conversation.');
  const deleteChatPromise = dataHandler.deleteChat(existingChat.id);

  const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise];
  opponentChatIds.forEach(opponentChatId => {
    promises.push(bot.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.'));
  });

  await Promise.all(promises);
}

bot.onText(/\/cancel_find/, async (msg) => {
  const chatId = msg.chat.id;
  const leaveLobbyPromise = dataHandler.leaveLobby(chatId);
  const leftMessagePromise = bot.sendMessage(chatId, 'Find chat cancelled. To find new chat, type /find_chat command.');

  await Promise.all([leaveLobbyPromise, leftMessagePromise]);
});

function isBotCommand(message: TelegramBot.Message): boolean {
  return message.entities && message.entities.length === 1 && message.entities[0].type === 'bot_command';
}

function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

// TODO: fix duplications below
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

bot.on('photo', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      const photoSize = msg.photo.length;
      const biggestPhoto = msg.photo[photoSize - 1];
      await bot.sendPhoto(opponentChatId, biggestPhoto.file_id);
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});

bot.on('video', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      await bot.sendVideo(opponentChatId, msg.video.file_id);
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});

bot.on('sticker', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      await bot.sendSticker(opponentChatId, msg.sticker.file_id);
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});

bot.on('document', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      await bot.sendDocument(opponentChatId, msg.document.file_id);
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});

bot.on('location', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      await bot.sendLocation(opponentChatId, msg.location.latitude, msg.location.longitude);
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});

bot.on('contact', async (msg) => {
  if (isBotCommand(msg)) return;
  const chatId = msg.chat.id;
  const existingChat = await dataHandler.findExistingChat(chatId);
  if (existingChat) {
    const opponentChatIds = getOpponentChatIds(existingChat, chatId);
    opponentChatIds.forEach(async opponentChatId => {
      await bot.sendContact(opponentChatId, msg.contact.phone_number, msg.contact.first_name, {last_name: msg.contact.last_name, vcard: msg.contact.vcard});
    });
  } else {
    await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
  }
});