import config from '../../config';
import { DataHandler } from '../DataHandler';
import { IUser } from '../models/User';
import { TelegramHandler } from '../TelegramHandler';

export abstract class CommandBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, languageCode: string) {
    this.dataHandler = dataHandler;
    this.telegramHandler = telegramHandler;
    this.chatId = chatId;
    this.languageCode = languageCode;
  }

  protected dataHandler: DataHandler;
  protected telegramHandler: TelegramHandler;
  protected chatId: number;
  protected languageCode: string;
  protected newUser: boolean;

  public async execute(): Promise<any> {
    let user = await this.dataHandler.getUser(this.chatId);
    if (!user) {
      this.newUser = true;
      const languageCode = await this.getLanguageCodeToCreate();
      user = await this.dataHandler.addUser(this.chatId, languageCode);
    } else {
      this.newUser = false;
    }
    await this._execute(user);
  }

  private async getLanguageCodeToCreate(): Promise<string> {
    const language = await this.dataHandler.getLanguage(this.languageCode);
    let languageCode: string;
    if (language) {
      languageCode = language.lang;
    } else {
      languageCode = config.DEFAULT_LANGUAGE_CODE;
    }
    return languageCode;
  }

  protected abstract _execute(user: IUser): Promise<any>;
}
