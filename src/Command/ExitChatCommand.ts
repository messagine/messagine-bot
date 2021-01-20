import { CommandBase } from './CommandBase';
import { getOpponentChatIds } from '../../handler';

export class ExitChatCommand extends CommandBase {
  public async _execute(): Promise<any> {
    const existingChat = await this.dataHandler.findExistingChat(this.chatId);

    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, this.chatId);
      const sendMessagePromise = this.telegramHandler.sendMessage(this.chatId, 'You have closed the conversation.');
      const deleteChatPromise = this.dataHandler.deleteChat(existingChat.id);
      const previousChatCreatePromise = this.dataHandler.createPreviousChat(existingChat.chatIds, existingChat.languageCode, this.chatId, existingChat.startDate);

      const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
      opponentChatIds.forEach(opponentChatId => {
        promises.push(this.telegramHandler.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.'));
      });

      await Promise.all(promises);
    } else {
      await this.telegramHandler.sendMessage(this.chatId, 'Chat doesn\'t exist.');
    }
  }
}
