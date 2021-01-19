import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class TextForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgText: string) {
    super(dataHandler, bot, chatId);
    this.msgText = msgText;
  }

  private msgText: string;

  async _forward(opponentChatId: number) {
    await this.bot.sendMessage(opponentChatId, this.msgText);
  }
}
