import { CommandBase } from './CommandBase';

export class ListLanguagesCommand extends CommandBase {
  public async _execute(): Promise<any> {
    const languages = await this.dataHandler.getLanguages();
    const message = languages.map(language => `${language.name}: ${language.lang}`).join('\n');

    await this.bot.sendMessage(this.chatId, message);
  }
}
