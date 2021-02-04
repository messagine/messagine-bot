import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class ChatIdNotFoundError extends ReplyError {
  constructor(ctx: IMessagineContext) {
    const message = ctx.i18n.t('chatid_not_found');
    super(message);
  }
}
