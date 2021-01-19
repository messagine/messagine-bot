import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../src/DataHandler';
import { ContactForwarder } from './ContactForwarder';
import { DocumentForwarder } from './DocumentForwarder';
import { LocationForwarder } from './LocationForwarder';
import { MessageForwarderBase } from './MessageForwarderBase';
import { PhotoForwarder } from './PhotoForwarder';
import { StickerForwarder } from './StickerForwarder';
import { TextForwarder } from './TextForwarder';
import { VideoForwarder } from './VideoForwarder';

export class MessageForwardFactory {
  public forwarder(dataHandler: DataHandler, bot: TelegramBot, chatId: number, message: TelegramBot.Message): MessageForwarderBase | undefined {
    const msgPhoto = message.photo;
    if (msgPhoto) return new PhotoForwarder(dataHandler, bot, chatId, msgPhoto);

    const msgVideo = message.video;
    if (msgVideo) return new VideoForwarder(dataHandler, bot, chatId, msgVideo);

    const msgSticker = message.sticker;
    if (msgSticker) return new StickerForwarder(dataHandler, bot, chatId, msgSticker);

    const msgDocument = message.document;
    if (msgDocument) return new DocumentForwarder(dataHandler, bot, chatId, msgDocument);

    const msgLocation = message.location;
    if (msgLocation) return new LocationForwarder(dataHandler, bot, chatId, msgLocation);

    const msgContact = message.contact;
    if (msgContact) return new ContactForwarder(dataHandler, bot, chatId, msgContact);

    const msgText = message.text;
    if (msgText) return new TextForwarder(dataHandler, bot, chatId, msgText);
  }
}