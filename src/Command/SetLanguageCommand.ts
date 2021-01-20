import { IUser } from '../models/User';
import { CommandBase } from './CommandBase';

export class SetLanguageCommand extends CommandBase {
  public async _execute(user: IUser): Promise<any> {
    let retryMessage: string;
    if (user.languageCode) {
      retryMessage = `Your language is ${user.languageCode}. Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.`;
    } else {
      retryMessage = 'Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.';
    }
    await this.telegramHandler.sendMessage(this.chatId, retryMessage);
  }
}
