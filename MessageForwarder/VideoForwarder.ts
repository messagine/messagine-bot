import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class VideoForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgVideo: TelegramBot.Video) {
    super(dataHandler, bot, chatId);
    this.msgVideo = msgVideo;
  }

  private msgVideo: TelegramBot.Video;

  async _forward(opponentChatId: number) {
    await this.bot.sendVideo(opponentChatId, this.msgVideo.file_id);
  }
}
