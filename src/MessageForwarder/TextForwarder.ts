import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';

export class TextForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgText: string) {
    super(dataHandler, telegramHandler, chatId);
    this.msgText = msgText;
  }

  private msgText: string;

  async _forward(opponentChatId: number) {
    await this.telegramHandler.sendMessage(opponentChatId, this.msgText);
  }
}
