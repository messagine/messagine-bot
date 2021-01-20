import TelegramBot from 'node-telegram-bot-api';
import { CommandFactory } from './Command/CommandFactory';
import { MessageForwardFactory } from './MessageForwarder/MessageForwardFactory';
import { DataHandler } from './src/DataHandler';
import { IChat } from './src/models/Chat';

const defaultLanguageCode = 'en';

export const successResponse = {
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
  if (msgText && isBotCommand(msg)) {
    const commandFactory = new CommandFactory();
    const commander = commandFactory.commander(dataHandler, bot, chatId, msgText, languageCode);
    await commander.execute();
  } else {
    const messageForwarderFactory = new MessageForwardFactory();
    const forwarder = messageForwarderFactory.forwarder(dataHandler, bot, chatId, msg);
    await forwarder.forward();
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