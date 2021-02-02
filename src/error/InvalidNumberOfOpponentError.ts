import { ReplyError } from './ReplyError';

export class InvalidNumberOfOpponentError extends ReplyError {
  constructor(chatId: number, opponentChatIds: number[]) {
    super(`Invalid number of opponents found.`);
    this.data = { chatId, opponentChatIds };
  }
}
