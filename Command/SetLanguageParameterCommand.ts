import TelegramBot from 'node-telegram-bot-api';
import { CommandBase } from './CommandBase';
import { DataHandler } from '../src/DataHandler';
import { successResponse } from '../handler';

export class SetLanguageParameterCommand extends CommandBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, newLanguageCode: string) {
    super(dataHandler, bot, chatId);
    this.newLanguageCode = newLanguageCode;
  }

  private newLanguageCode: string;

  public async execute(): Promise<any> {
    const user = await this.dataHandler.getUser(this.chatId);
    let currentLanguageCode = '';
    if (user && user.languageCode) {
      currentLanguageCode = user.languageCode;
    }

    if (this.newLanguageCode === currentLanguageCode) {
      await this.bot.sendMessage(this.chatId, `Your language not changed.`);
      return successResponse;
    }

    const newLanguage = await this.dataHandler.getLanguage(this.newLanguageCode);
    if (!newLanguage) {
      await this.bot.sendMessage(this.chatId, `Language code ${this.newLanguageCode} not found. Type /list_languages to list all available languages.`);
      return successResponse;
    }

    const successMessagePromise = this.bot.sendMessage(this.chatId, `Your language set to ${newLanguage.name}.`);
    const setLanguagePromise = this.dataHandler.setLanguage(this.chatId, this.newLanguageCode);
    await Promise.all([successMessagePromise, setLanguagePromise]);
    return successResponse;
  }
}
