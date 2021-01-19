import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class DocumentForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgDocument: TelegramBot.Document) {
    super(dataHandler, bot, chatId);
    this.msgDocument = msgDocument;
  }

  private msgDocument: TelegramBot.Document;

  async _forward(opponentChatId: number) {
    await this.bot.sendDocument(opponentChatId, this.msgDocument.file_id);
  }
}
