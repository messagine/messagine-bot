import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class StickerForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgSticker: TelegramBot.Sticker) {
    super(dataHandler, bot, chatId);
    this.msgSticker = msgSticker;
  }

  private msgSticker: TelegramBot.Sticker;

  async _forward(opponentChatId: number) {
    await this.bot.sendSticker(opponentChatId, this.msgSticker.file_id);
  }
}
