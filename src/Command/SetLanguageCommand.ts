import { InlineKeyboardButton } from 'node-telegram-bot-api';
import config from '../../config';
import { IUser } from '../models/User';
import { CommandBase } from './CommandBase';

export class SetLanguageCommand extends CommandBase {
  public async _execute(user: IUser): Promise<any> {
    const languages = await this.dataHandler.getLanguages();
    const callbackJoin = config.CALLBACK_JOIN;
    const maxRowChars = config.MAC_ROWCHARS_IN_INLINE;

    const inlineKeyboardItems: InlineKeyboardButton[] = languages.map(language => { return { text: language.name, callback_data: `LANG${callbackJoin}${language.lang}` }});
    const inlineKeyboard: InlineKeyboardButton[][] = [];

    let currentRow: InlineKeyboardButton[] = []
    inlineKeyboardItems.forEach(item => {
      if (currentRow.length > 0) {
        const currentRowCharLength = currentRow.reduce((sum, current) => sum + current.text.length, 0);
        const itemTextLength = item.text.length;
        if (currentRowCharLength + itemTextLength > maxRowChars) {
          inlineKeyboard.push(currentRow);
          currentRow = [item];
        } else {
          currentRow.push(item);
        }
      } else {
        currentRow.push(item);
      }
    });
    if (currentRow.length > 0) inlineKeyboard.push(currentRow);

    const chooseMessage = `Your language is ${user.languageCode}. Choose language below.`;
    const options = { reply_markup: { inline_keyboard: inlineKeyboard } };
    await this.telegramHandler.sendMessage(this.chatId, chooseMessage, options);
  }
}
