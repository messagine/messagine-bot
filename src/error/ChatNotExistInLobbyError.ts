import { Markup } from 'telegraf';
import { IMessagineContext } from '../lib/common';
import { cancelFindCallbackButton, helpCallbackButton } from '../reply';
import { ReplyError } from './ReplyError';

export class ChatNotExistInLobbyError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number) {
    const message = ctx.i18n.t('chat_not_exist_in_lobby');
    super(message);
    this.extra = Markup.inlineKeyboard([[cancelFindCallbackButton(ctx), helpCallbackButton(ctx)]]).extra();
    this.data = { chatId };
  }
}
