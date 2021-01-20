import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../src/DataHandler';

export abstract class CommandBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number) {
    this.dataHandler = dataHandler;
    this.bot = bot;
    this.chatId = chatId;
  }

  protected dataHandler: DataHandler;
  protected bot: TelegramBot;
  protected chatId: number;

  public abstract execute(): Promise<any>;
}
