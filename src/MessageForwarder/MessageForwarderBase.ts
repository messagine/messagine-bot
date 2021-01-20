import { DataHandler } from '../DataHandler';
import { getOpponentChatIds } from '../../handler';
import { TelegramHandler } from '../TelegramHandler';

export abstract class MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number) {
    this.dataHandler = dataHandler;
    this.telegramHandler = telegramHandler;
    this.chatId = chatId;
  }

  protected dataHandler: DataHandler;
  protected telegramHandler: TelegramHandler;
  protected chatId: number;

  public async forward() {
    const existingChat = await this.dataHandler.findExistingChat(this.chatId);
    if (existingChat) {
      const opponentChatIds = getOpponentChatIds(existingChat, this.chatId);
      const opponentPromises: Promise<any>[] = [];
      opponentChatIds.forEach(opponentChatId => {
        const opponentPromise = this._forward(opponentChatId);
        opponentPromises.push(opponentPromise);
      })
      await Promise.all(opponentPromises);
    } else {
      await this.telegramHandler.sendMessage(this.chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
  }

  abstract _forward(opponentChatId: number): Promise<any>;
}
