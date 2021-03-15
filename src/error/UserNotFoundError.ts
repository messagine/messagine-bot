import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class UserNotFoundError extends ReplyError {
  constructor(ctx: IMessagineContext) {
    const message = ctx.i18n.t('user_not_found');
    super(message);
  }
}
