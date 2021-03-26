import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class InvalidPeopleInChatError extends ReplyError {
  constructor(ctx: IMessagineContext, chatIds: number[]) {
    const message = ctx.i18n.t('invalid_people_in_chat_error');
    super(message);
    this.data = { chatIds };
  }
}
