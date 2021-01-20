import TelegramBot from 'node-telegram-bot-api';
import { CommandBase } from './CommandBase';
import { DataHandler } from '../src/DataHandler';
import { IUser } from '../src/models/User';

export class SetLanguageParameterCommand extends CommandBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, languageCode: string, newLanguageCode: string) {
    super(dataHandler, bot, chatId, languageCode);
    this.newLanguageCode = newLanguageCode;
  }

  private newLanguageCode: string;

  public async _execute(user: IUser): Promise<any> {
    if (this.newLanguageCode === user.languageCode) {
      await this.bot.sendMessage(this.chatId, `Your language not changed.`);
      return;
    }

    const newLanguage = await this.dataHandler.getLanguage(this.newLanguageCode);
    if (!newLanguage) {
      await this.bot.sendMessage(this.chatId, `Language code ${this.newLanguageCode} not found. Type /list_languages to list all available languages.`);
      return;
    }

    const successMessagePromise = this.bot.sendMessage(this.chatId, `Your language set to ${newLanguage.name}.`);
    const setLanguagePromise = this.dataHandler.setLanguage(this.chatId, this.newLanguageCode);
    await Promise.all([successMessagePromise, setLanguagePromise]);
  }
}
