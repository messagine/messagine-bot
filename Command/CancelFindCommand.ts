import { CommandBase } from './CommandBase';
import { successResponse } from '../handler';

export class CancelFindCommand extends CommandBase {
  public async execute(): Promise<any> {
    const leaveLobbyPromise = this.dataHandler.leaveLobby(this.chatId);
    const leftMessagePromise = this.bot.sendMessage(this.chatId, 'Find chat cancelled. To find new chat, type /find_chat command.');

    await Promise.all([leaveLobbyPromise, leftMessagePromise]);
    return successResponse;
  }
}
