import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';

export class PhotoForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgPhoto: TelegramBot.PhotoSize[]) {
    super(dataHandler, telegramHandler, chatId);
    this.msgPhoto = msgPhoto;
  }

  private msgPhoto: TelegramBot.PhotoSize[];

  async _forward(opponentChatId: number) {
    const photoSize = this.msgPhoto.length;
    const biggestPhoto = this.msgPhoto[photoSize - 1];
    await this.telegramHandler.sendPhoto(opponentChatId, biggestPhoto.file_id);
  }
}
