import resource from '../resource';
import { ReplyError } from './ReplyError';

export class ChatNotExistError extends ReplyError {
  constructor(chatId: number) {
    super(resource.CHAT_NOT_EXIST);
    this.data = { chatId };
  }
}
