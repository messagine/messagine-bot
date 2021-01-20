import { CommandBase } from './CommandBase';
import { getOpponentChatIds, successResponse } from '../handler';

export class ExitChatCommand extends CommandBase {
  public async execute(): Promise<any> {
    const existingChat = await this.dataHandler.findExistingChat(this.chatId);

    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, this.chatId);
      const sendMessagePromise = this.bot.sendMessage(this.chatId, 'You have closed the conversation.');
      const deleteChatPromise = this.dataHandler.deleteChat(existingChat.id);
      const previousChatCreatePromise = this.dataHandler.createPreviousChat(existingChat.chatIds, existingChat.languageCode, this.chatId, existingChat.startDate);

      const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
      opponentChatIds.forEach(opponentChatId => {
        promises.push(this.bot.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.'));
      });

      await Promise.all(promises);
    } else {
      await this.bot.sendMessage(this.chatId, 'Chat doesn\'t exist.');
    }
    return successResponse;
  }
}
