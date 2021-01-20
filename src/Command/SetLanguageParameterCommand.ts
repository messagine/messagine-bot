import { CommandBase } from './CommandBase';
import { DataHandler } from '../DataHandler';
import { IUser } from '../models/User';
import { TelegramHandler } from '../TelegramHandler';

export class SetLanguageParameterCommand extends CommandBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, languageCode: string, newLanguageCode: string) {
    super(dataHandler, telegramHandler, chatId, languageCode);
    this.newLanguageCode = newLanguageCode;
  }

  private newLanguageCode: string;

  public async _execute(user: IUser): Promise<any> {
    if (this.newLanguageCode === user.languageCode) {
      await this.telegramHandler.sendMessage(this.chatId, `Your language not changed.`);
      return;
    }

    const newLanguage = await this.dataHandler.getLanguage(this.newLanguageCode);
    if (!newLanguage) {
      await this.telegramHandler.sendMessage(this.chatId, `Language code ${this.newLanguageCode} not found. Type /list_languages to list all available languages.`);
      return;
    }

    const successMessagePromise = this.telegramHandler.sendMessage(this.chatId, `Your language set to ${newLanguage.name}.`);
    const setLanguagePromise = this.dataHandler.setLanguage(this.chatId, this.newLanguageCode);
    await Promise.all([successMessagePromise, setLanguagePromise]);
  }
}
