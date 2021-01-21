import { InlineKeyboardButton } from 'node-telegram-bot-api';
import _ from 'lodash';
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
      const currentRowLength = currentRow.length;
      if (currentRowLength > 0) {
        const longestItemLength = _.maxBy(currentRow, cr => cr.text.length)?.text.length ?? maxRowChars;
        const itemTextLength = item.text.length;
        const maxNewListItemLength = _.max([longestItemLength, itemTextLength]) ?? 0;
        const maxPerItemLengthForAdd = Math.round(maxRowChars / (currentRowLength + 1));
        const addToCurrentRow = maxNewListItemLength <= maxPerItemLengthForAdd;

        if (addToCurrentRow) {
          currentRow.push(item);
        } else {
          inlineKeyboard.push(currentRow);
          currentRow = [item];
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
