import { CommandBase } from './CommandBase';
import { successResponse } from '../handler';

export class FindChatCommand extends CommandBase {
  public async execute(): Promise<any> {
    const lobbyPromise = this.dataHandler.findLobby(this.chatId);
    const existingChatPromise = this.dataHandler.findExistingChat(this.chatId);
    const userPromise = this.dataHandler.getUser(this.chatId);
    const checkResults = await Promise.all([lobbyPromise, existingChatPromise, userPromise]);

    const lobby = checkResults[0];
    if (lobby) {
      await this.bot.sendMessage(this.chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');
      return;
    }

    const existingChat = checkResults[1];
    if (existingChat) {
      await this.bot.sendMessage(this.chatId, 'You are in an active chat. To exit current chat type /exit_chat and try again.');
      return;
    }

    const user = checkResults[2];
    if (!user || !user.languageCode) {
      await this.bot.sendMessage(this.chatId, 'Set your language via /set_language and try again.');
      return;
    }

    const opponent = await this.dataHandler.findOpponentInLobby(this.chatId, user.languageCode);

    if (opponent) {
      const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';

      const leaveCurrentUserLobbyPromise = this.dataHandler.leaveLobby(this.chatId);
      const leaveOpponentUserLobbyPromise = this.dataHandler.leaveLobby(opponent.chatId);
      const createChatPromise = this.dataHandler.createChat(this.chatId, opponent.chatId, user.languageCode);
      const chatStartToCurrentUserPromise = this.bot.sendMessage(this.chatId, chatStartMessage);
      const chatStartToOpponentUserPromise = this.bot.sendMessage(opponent.chatId, chatStartMessage);

      await Promise.all([leaveCurrentUserLobbyPromise, leaveOpponentUserLobbyPromise, createChatPromise, chatStartToCurrentUserPromise, chatStartToOpponentUserPromise]);
    } else {
      const addToLobbyPromise = this.dataHandler.addToLobby(this.chatId, user.languageCode);
      const lobbyMessagePromise = this.bot.sendMessage(this.chatId, 'Waiting in the lobby. You can exit lobby via /cancel_find command.');

      await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
    }
    return successResponse;
  }
}
