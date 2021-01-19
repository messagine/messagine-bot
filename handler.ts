import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from './src/DataHandler';
import { IChat } from './src/models/Chat';

const defaultLanguageCode = 'en';

const successResponse = {
  statusCode: 200,
  body: JSON.stringify({ message: 'success' })
}

export async function main(event) {
  const body = JSON.parse(event.body);
  if (!body.message) return successResponse;
  const msg: TelegramBot.Message = body.message;
  if (msg.from?.is_bot) return successResponse;
  const dataHandler = new DataHandler();
  await dataHandler.connect();

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return successResponse;

  const bot = new TelegramBot(botToken);
  const chatId = msg.chat.id;
  const languageCode = msg.from?.language_code ?? defaultLanguageCode;

  const msgText = msg.text;
  if (msgText) {
    if (isBotCommand(msg)) {
      if (msgText.match(/\/start/)) {
        const user = await dataHandler.getUser(chatId);
        if (user) {
          await bot.sendMessage(chatId, 'Welcome back. To find new chat, type /find_chat command.');
        } else {
          await dataHandler.addUser(chatId, languageCode);
          await bot.sendMessage(chatId, `Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${languageCode}, to change your language type /set_language`);
        }
        return successResponse;
      }

      const setLanguageMatch = msgText.match(/\/set_language (.+)/)
      if (setLanguageMatch) {
        const user = await dataHandler.getUser(chatId);
        let currentLanguageCode = '';
        if (user && user.languageCode) {
          currentLanguageCode = user.languageCode;
        }
        const newLanguageCode = (setLanguageMatch[1]).toLowerCase();

        if (newLanguageCode === currentLanguageCode) {
          await bot.sendMessage(chatId, `Your language not changed.`);
          return;
        }

        const newLanguage = await dataHandler.getLanguage(newLanguageCode);
        if (!newLanguage) {
          await bot.sendMessage(chatId, `Language code ${newLanguageCode} not found. Type /list_languages to list all available languages.`);
          return;
        }

        const successMessagePromise = bot.sendMessage(chatId, `Your language set to ${newLanguage.name}.`);
        const setLanguagePromise = dataHandler.setLanguage(chatId, newLanguageCode);
        await Promise.all([successMessagePromise, setLanguagePromise]);
        return successResponse;
      }

      if (msgText.match(/\/set_language/)) {
        const user = await dataHandler.getUser(chatId);
        let currentLanguageCode = '';
        if (user && user.languageCode) {
          currentLanguageCode = user.languageCode;
        }

        let retryMessage: string;
        if (currentLanguageCode) {
          retryMessage = `Your language is ${currentLanguageCode}. Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.`;
        } else {
          retryMessage = 'Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.';
        }
        await bot.sendMessage(chatId, retryMessage);
        return successResponse;
      }

      if (msgText.match(/\/list_languages/)) {
        const languages = await dataHandler.getLanguages();
        const message = languages.map(language => `${language.name}: ${language.lang}`).join('\n');

        await bot.sendMessage(chatId, message);
        return successResponse;
      }

      if (msgText.match(/\/find_chat/)) {
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
        return successResponse;
      }

      if (msgText.match(/\/exit_chat/)) {
        const existingChat = await dataHandler.findExistingChat(chatId);

        if (existingChat) {
          const opponentChatIds = getOpponentChatIds(existingChat, chatId);
          const sendMessagePromise = bot.sendMessage(chatId, 'You have closed the conversation.');
          const deleteChatPromise = dataHandler.deleteChat(existingChat.id);
          const previousChatCreatePromise = dataHandler.createPreviousChat(existingChat.chatIds, existingChat.languageCode, chatId, existingChat.startDate);

          const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
          opponentChatIds.forEach(opponentChatId => {
            promises.push(bot.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.'));
          });

          await Promise.all(promises);
        } else {
          await bot.sendMessage(chatId, 'Chat doesn\'t exist.');
        }
        return successResponse;
      }

      if (msgText.match(/\/cancel_find/)) {
        const leaveLobbyPromise = dataHandler.leaveLobby(chatId);
        const leftMessagePromise = bot.sendMessage(chatId, 'Find chat cancelled. To find new chat, type /find_chat command.');

        await Promise.all([leaveLobbyPromise, leftMessagePromise]);
        return successResponse;
      }
      return successResponse;
    }
  }

  const msgPhoto = msg.photo;
  if (msgPhoto) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        const photoSize = msgPhoto.length;
        const biggestPhoto = msgPhoto[photoSize - 1];
        await bot.sendPhoto(opponentChatId, biggestPhoto.file_id);
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  const msgVideo = msg.video;
  if (msgVideo) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        await bot.sendVideo(opponentChatId, msgVideo.file_id);
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  const msgSticker = msg.sticker;
  if (msgSticker) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        await bot.sendSticker(opponentChatId, msgSticker.file_id);
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  const msgDocument = msg.document;
  if (msgDocument) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        await bot.sendDocument(opponentChatId, msgDocument.file_id);
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  const msgLocation = msg.location;
  if (msgLocation) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        await bot.sendLocation(opponentChatId, msgLocation.latitude, msgLocation.longitude);
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  const msgContact = msg.contact;
  if (msgContact) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => {
        await bot.sendContact(opponentChatId, msgContact.phone_number, msgContact.first_name, {last_name: msgContact.last_name, vcard: msgContact.vcard});
      });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
  }

  if (msgText) {
    const existingChat = await dataHandler.findExistingChat(chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, chatId);
      opponentChatIds.forEach(async opponentChatId => { await bot.sendMessage(opponentChatId, msgText); });
    } else {
      await bot.sendMessage(chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
    return successResponse;
  }

  return successResponse;
}

function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

function isBotCommand(message: TelegramBot.Message): boolean {
  return message?.entities?.length === 1 && message.entities[0].type === 'bot_command';
}