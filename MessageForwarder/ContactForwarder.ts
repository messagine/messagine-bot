import TelegramBot from 'node-telegram-bot-api';
import { MessageForwarderBase } from './MessageForwarderBase';
import { DataHandler } from '../src/DataHandler';

export class ContactForwarder extends MessageForwarderBase {
  constructor(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgContact: TelegramBot.Contact) {
    super(dataHandler, bot, chatId);
    this.msgContact = msgContact;
  }

  private msgContact: TelegramBot.Contact;

  async _forward(opponentChatId: number) {
    await this.bot.sendContact(opponentChatId, this.msgContact.phone_number, this.msgContact.first_name, { last_name: this.msgContact.last_name, vcard: this.msgContact.vcard });
  }
}
