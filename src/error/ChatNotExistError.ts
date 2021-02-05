import { IMessagineContext } from '../lib/common';
import { commandEnum } from '../lib/enums';
import { ReplyError } from './ReplyError';

export class ChatNotExistError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number) {
    const message = ctx.i18n.t('chat_not_exist', { findChatCommand: commandEnum.findChat });
    super(message);
    this.data = { chatId };
  }
}
