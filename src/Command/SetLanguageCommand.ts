import { InlineKeyboardButton } from 'node-telegram-bot-api';
import config from '../../config';
import { IUser } from '../models/User';
import { CommandBase } from './CommandBase';

export class SetLanguageCommand extends CommandBase {
  public async _execute(user: IUser): Promise<any> {
    const languages = await this.dataHandler.getLanguages();
    const callbackJoin = config.CALLBACK_JOIN;
    const languagesInRow = config.LANGUAGES_IN_ROW;

    const inlineKeyboardItems: InlineKeyboardButton[] = languages.map(language => { return { text: language.name, callback_data: `LANG${callbackJoin}${language.lang}` }});
    const inlineKeyboard: InlineKeyboardButton[][] = [];
    while(inlineKeyboardItems.length) inlineKeyboard.push(inlineKeyboardItems.splice(0, languagesInRow));

    const chooseMessage = `Your language is ${user.languageCode}. Choose language below.`;
    const options = { reply_markup: { inline_keyboard: inlineKeyboard } };
    await this.telegramHandler.sendMessage(this.chatId, chooseMessage, options);
  }
}
