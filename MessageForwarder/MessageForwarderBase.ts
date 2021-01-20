import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../src/DataHandler';
import { getOpponentChatIds } from '../handler';

export abstract class MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number) {
    this.dataHandler = dataHandler;
    this.bot = bot;
    this.chatId = chatId;
  }

  protected dataHandler: DataHandler;
  protected bot: TelegramBot;
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
      await this.bot.sendMessage(this.chatId, 'Chat doesn\'t exist. To find new chat, type /find_chat command.');
    }
  }

  abstract _forward(opponentChatId: number): Promise<any>;
}
