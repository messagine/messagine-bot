import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class LocationForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgLocation: TelegramBot.Location) {
    super(dataHandler, bot, chatId);
    this.msgLocation = msgLocation;
  }

  private msgLocation: TelegramBot.Location;

  async _forward(opponentChatId: number) {
    await this.bot.sendLocation(opponentChatId, this.msgLocation.latitude, this.msgLocation.longitude);
  }
}
