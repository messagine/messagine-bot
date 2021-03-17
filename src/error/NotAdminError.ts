import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class NotAdminError extends ReplyError {
  constructor(ctx: IMessagineContext) {
    const message = ctx.i18n.t('not_admin_error');
    super(message);
  }
}
