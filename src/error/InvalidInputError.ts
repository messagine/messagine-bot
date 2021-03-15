import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class InvalidInputError extends ReplyError {
  constructor(ctx: IMessagineContext) {
    const message = ctx.i18n.t('invalid_input');
    super(message);
  }
}
