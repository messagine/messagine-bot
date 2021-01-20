import { IUser } from '../models/User';
import { CommandBase } from './CommandBase';

export class SetLanguageCommand extends CommandBase {
  public async _execute(user: IUser): Promise<any> {
    let retryMessage: string;
    if (user.languageCode) {
      retryMessage = `Your language is ${user.languageCode}. Choose language below.`;
    } else {
      retryMessage = 'Choose language below.';
    }

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'English', callback_data: '/set_language en' }],
          [{ text: 'Turkish', callback_data: '/set_language tr' }]
        ]
      }
    };

    await this.telegramHandler.sendMessage(this.chatId, retryMessage, options);
  }
}
