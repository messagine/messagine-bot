import { CommandBase } from './CommandBase';

export class SetLanguageCommand extends CommandBase {
  public async execute(): Promise<any> {
    const user = await this.dataHandler.getUser(this.chatId);
    let currentLanguageCode = '';
    if (user && user.languageCode) {
      currentLanguageCode = user.languageCode;
    }

    let retryMessage: string;
    if (currentLanguageCode) {
      retryMessage = `Your language is ${currentLanguageCode}. Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.`;
    } else {
      retryMessage = 'Type /set_language [lang] (e.g. /set_language en) to change your language. Type /list_languages to list all available languages.';
    }
    await this.bot.sendMessage(this.chatId, retryMessage);
  }
}
