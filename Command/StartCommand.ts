import TelegramBot from 'node-telegram-bot-api';
import { CommandBase } from './CommandBase';
import { DataHandler } from '../src/DataHandler';
import { successResponse } from '../handler';

export class StartCommand extends CommandBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, languageCode: string) {
    super(dataHandler, bot, chatId);
    this.languageCode = languageCode;
  }

  private languageCode: string;

  public async execute() {
    const user = await this.dataHandler.getUser(this.chatId);
    if (user) {
      await this.bot.sendMessage(this.chatId, 'Welcome back. To find new chat, type /find_chat command.');
    } else {
      await this.dataHandler.addUser(this.chatId, this.languageCode);
      await this.bot.sendMessage(this.chatId, `Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${this.languageCode}, to change your language type /set_language`);
    }
    return successResponse;
  }
}
