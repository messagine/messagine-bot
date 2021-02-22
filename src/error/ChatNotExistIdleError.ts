import { Markup } from 'telegraf';
import { IMessagineContext } from '../lib/common';
import { findChatCallbackButton, helpCallbackButton } from '../reply';
import { ReplyError } from './ReplyError';

export class ChatNotExistIdleError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number) {
    const message = ctx.i18n.t('chat_not_exist_idle');
    super(message);
    this.extra = Markup.inlineKeyboard([[findChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra();
    this.data = { chatId };
  }
}
