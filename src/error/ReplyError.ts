import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export class ReplyError extends Error {
  protected data: {};
  protected extra: ExtraReplyMessage | undefined;
  constructor(message: string) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    this.data = {};
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    // @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
