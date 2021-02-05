import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class InvalidNumberOfOpponentError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number, opponentChatIds: number[]) {
    const message = ctx.i18n.t('invalid_opponent_error');
    super(message);
    this.data = { chatId, opponentChatIds };
  }
}
