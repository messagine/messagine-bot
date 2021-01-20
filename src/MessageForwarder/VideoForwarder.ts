import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';

export class VideoForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgVideo: TelegramBot.Video) {
    super(dataHandler, telegramHandler, chatId);
    this.msgVideo = msgVideo;
  }

  private msgVideo: TelegramBot.Video;

  async _forward(opponentChatId: number) {
    await this.telegramHandler.sendVideo(opponentChatId, this.msgVideo.file_id);
  }
}
