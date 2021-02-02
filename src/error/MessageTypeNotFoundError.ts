import { ReplyError } from './ReplyError';

export class MessageTypeNotFoundError extends ReplyError {
  constructor(chatId: number, messageType: string) {
    super(`Message ${messageType} not found.`);
    this.data = { chatId, messageType };
  }
}
