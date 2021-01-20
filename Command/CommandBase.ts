import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../src/DataHandler';
import { IUser } from '../src/models/User';

export abstract class CommandBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, languageCode: string) {
    this.dataHandler = dataHandler;
    this.bot = bot;
    this.chatId = chatId;
    this.languageCode = languageCode;
  }

  protected dataHandler: DataHandler;
  protected bot: TelegramBot;
  protected chatId: number;
  protected languageCode: string;
  protected newUser: boolean;

  public async execute(): Promise<any> {
    let user = await this.dataHandler.getUser(this.chatId);
    if (!user) {
      this.newUser = true;
      user = await this.dataHandler.addUser(this.chatId, this.languageCode);
    } else {
      this.newUser = false;
    }
    await this._execute(user);
  }

  protected abstract _execute(user: IUser): Promise<any>;
}
