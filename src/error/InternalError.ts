import { ReplyError } from './ReplyError';

export class InternalError extends ReplyError {
  constructor(error: Error) {
    super(error.message);
    this.data = { error };
  }
}
