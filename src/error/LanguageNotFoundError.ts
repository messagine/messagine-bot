import { IMessagineContext } from '../lib/common';
import { ReplyError } from './ReplyError';

export class LanguageNotFoundError extends ReplyError {
  constructor(ctx: IMessagineContext, chatId: number, code: string) {
    const message = ctx.i18n.t('language_not_found');
    super(message);
    this.data = { chatId, code };
  }
}
