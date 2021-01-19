import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class PhotoForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgPhoto: TelegramBot.PhotoSize[]) {
    super(dataHandler, bot, chatId);
    this.msgPhoto = msgPhoto;
  }

  private msgPhoto: TelegramBot.PhotoSize[];

  async _forward(opponentChatId: number) {
    const photoSize = this.msgPhoto.length;
    const biggestPhoto = this.msgPhoto[photoSize - 1];
    await this.bot.sendPhoto(opponentChatId, biggestPhoto.file_id);
  }
}
