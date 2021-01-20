import { CommandBase } from './CommandBase';
import { successResponse } from '../handler';

export class ListLanguagesCommand extends CommandBase {
  public async execute(): Promise<any> {
    const languages = await this.dataHandler.getLanguages();
    const message = languages.map(language => `${language.name}: ${language.lang}`).join('\n');

    await this.bot.sendMessage(this.chatId, message);
    return successResponse;
  }
}
