import { CommandBase } from './CommandBase';

export class CancelFindCommand extends CommandBase {
  public async _execute(): Promise<any> {
    const leaveLobbyPromise = this.dataHandler.leaveLobby(this.chatId);
    const leftMessagePromise = this.bot.sendMessage(this.chatId, 'Find chat cancelled. To find new chat, type /find_chat command.');

    await Promise.all([leaveLobbyPromise, leftMessagePromise]);
  }
}
