import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class MessageTypeNotFoundError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number, messageType: string) {
    const message = ctx.i18n.t('message_type_not_found', {messageType});
    super(message);
    this.data = { chatId, messageType };
  }
}
