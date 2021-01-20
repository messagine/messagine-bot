import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';

export class StickerForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgSticker: TelegramBot.Sticker) {
    super(dataHandler, telegramHandler, chatId);
    this.msgSticker = msgSticker;
  }

  private msgSticker: TelegramBot.Sticker;

  async _forward(opponentChatId: number) {
    await this.telegramHandler.sendSticker(opponentChatId, this.msgSticker.file_id);
  }
}