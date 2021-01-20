import { IUser } from '../models/User';
import { CommandBase } from './CommandBase';

export class FindChatCommand extends CommandBase {
  public async _execute(user: IUser): Promise<any> {
    const lobbyPromise = this.dataHandler.findLobby(this.chatId);
    const existingChatPromise = this.dataHandler.findExistingChat(this.chatId);
    const checkResults = await Promise.all([lobbyPromise, existingChatPromise]);

    const lobby = checkResults[0];
    if (lobby) {
      await this.telegramHandler.sendMessage(this.chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');
      return;
    }

    const existingChat = checkResults[1];
    if (existingChat) {
      await this.telegramHandler.sendMessage(this.chatId, 'You are in an active chat. To exit current chat type /exit_chat and try again.');
      return;
    }

    const opponent = await this.dataHandler.findOpponentInLobby(this.chatId, user.languageCode);

    if (opponent) {
      const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';

      const leaveCurrentUserLobbyPromise = this.dataHandler.leaveLobby(this.chatId);
      const leaveOpponentUserLobbyPromise = this.dataHandler.leaveLobby(opponent.chatId);
      const createChatPromise = this.dataHandler.createChat(this.chatId, opponent.chatId, user.languageCode);
      const chatStartToCurrentUserPromise = this.telegramHandler.sendMessage(this.chatId, chatStartMessage);
      const chatStartToOpponentUserPromise = this.telegramHandler.sendMessage(opponent.chatId, chatStartMessage);

      await Promise.all([leaveCurrentUserLobbyPromise, leaveOpponentUserLobbyPromise, createChatPromise, chatStartToCurrentUserPromise, chatStartToOpponentUserPromise]);
    } else {
      const addToLobbyPromise = this.dataHandler.addToLobby(this.chatId, user.languageCode);
      const lobbyMessagePromise = this.telegramHandler.sendMessage(this.chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');

      await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
    }
  }
}
