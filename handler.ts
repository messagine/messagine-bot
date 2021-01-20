import TelegramBot from 'node-telegram-bot-api';
import { CommandFactory } from './src/Command/CommandFactory';
import { MessageForwardFactory } from './src/MessageForwarder/MessageForwardFactory';
import { DataHandler } from './src/DataHandler';
import { IChat } from './src/models/Chat';
import { TelegramHandler } from './src/TelegramHandler';
import config from './config';
import { CallbackType } from './enum';

const successResponse = {
  statusCode: 200,
  body: JSON.stringify({ message: 'success' })
}

export async function main(event) {
  const body = JSON.parse(event.body);
  if (body.message) {
    const msg: TelegramBot.Message = body.message;
    if (msg.from?.is_bot) return successResponse;
    const dataHandler = new DataHandler();
    await dataHandler.connect();

    const telegramHandler = new TelegramHandler();
    const chatId = msg.chat.id;
    const languageCode = msg.from?.language_code ?? config.DEFAULT_LANGUAGE_CODE;

    const msgText = msg.text;
    if (msgText && isBotCommand(msg)) {
      const commandFactory = new CommandFactory();
      const commander = commandFactory.commander(dataHandler, telegramHandler, chatId, msgText, languageCode);
      await commander.execute();
    } else {
      const messageForwarderFactory = new MessageForwardFactory();
      const forwarder = messageForwarderFactory.forwarder(dataHandler, telegramHandler, chatId, msg);
      await forwarder.forward();
    }
  } else if (body.callback_query) {
    const callbackQuery: TelegramBot.CallbackQuery = body.callback_query;
    if (callbackQuery.from?.is_bot) return successResponse;
    const dataHandler = new DataHandler();
    await dataHandler.connect();

    const telegramHandler = new TelegramHandler();
    const chatId = callbackQuery?.message?.chat.id;
    if (!chatId) return successResponse;
    const callbackData = callbackQuery?.data;
    if (!callbackData) return successResponse;

    const callbackArgs = callbackData.split(config.CALLBACK_JOIN);
    if (callbackArgs.length !== 2) return successResponse;

    if (callbackArgs[0] === CallbackType.Language) {
      const newLanguageCode = callbackArgs[1];
      const user = await dataHandler.getUser(chatId);
      if (newLanguageCode === user.languageCode) {
        await telegramHandler.sendMessage(chatId, `Your language not changed.`);
        return successResponse;
      }

      const newLanguage = await dataHandler.getLanguage(newLanguageCode);
      if (!newLanguage) {
        await telegramHandler.sendMessage(chatId, `Language code ${newLanguageCode} not found. Type /list_languages to list all available languages.`);
        return successResponse;
      }

      const successMessagePromise = telegramHandler.sendMessage(chatId, `Your language set to ${newLanguage.name}.`);
      const setLanguagePromise = dataHandler.setLanguage(chatId, newLanguageCode);
      await Promise.all([successMessagePromise, setLanguagePromise]);
    }
  }

  return successResponse;
}

export function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

function isBotCommand(message: TelegramBot.Message): boolean {
  return message?.entities?.length === 1 && message.entities[0].type === 'bot_command';
}