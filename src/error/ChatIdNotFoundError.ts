import resource from '../resource';
import { ReplyError } from './ReplyError';

export class ChatIdNotFoundError extends ReplyError {
  constructor() {
    super(resource.CHATID_NOT_FOUND);
  }
}
