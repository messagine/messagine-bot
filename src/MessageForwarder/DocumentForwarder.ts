import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';

export class DocumentForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgDocument: TelegramBot.Document) {
    super(dataHandler, telegramHandler, chatId);
    this.msgDocument = msgDocument;
  }

  private msgDocument: TelegramBot.Document;

  async _forward(opponentChatId: number) {
    await this.telegramHandler.sendDocument(opponentChatId, this.msgDocument.file_id);
  }
}
