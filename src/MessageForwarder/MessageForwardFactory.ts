import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';
import { ContactForwarder } from './ContactForwarder';
import { DocumentForwarder } from './DocumentForwarder';
import { InvalidForwarder } from './InvalidForwarder';
import { LocationForwarder } from './LocationForwarder';
import { MessageForwarderBase } from './MessageForwarderBase';
import { PhotoForwarder } from './PhotoForwarder';
import { StickerForwarder } from './StickerForwarder';
import { TextForwarder } from './TextForwarder';
import { VideoForwarder } from './VideoForwarder';

export class MessageForwardFactory {
  public forwarder(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, message: TelegramBot.Message): MessageForwarderBase {
    const msgPhoto = message.photo;
    if (msgPhoto) return new PhotoForwarder(dataHandler, telegramHandler, chatId, msgPhoto);

    const msgVideo = message.video;
    if (msgVideo) return new VideoForwarder(dataHandler, telegramHandler, chatId, msgVideo);

    const msgSticker = message.sticker;
    if (msgSticker) return new StickerForwarder(dataHandler, telegramHandler, chatId, msgSticker);

    const msgDocument = message.document;
    if (msgDocument) return new DocumentForwarder(dataHandler, telegramHandler, chatId, msgDocument);

    const msgLocation = message.location;
    if (msgLocation) return new LocationForwarder(dataHandler, telegramHandler, chatId, msgLocation);

    const msgContact = message.contact;
    if (msgContact) return new ContactForwarder(dataHandler, telegramHandler, chatId, msgContact);

    const msgText = message.text;
    if (msgText) return new TextForwarder(dataHandler, telegramHandler, chatId, msgText);

    return new InvalidForwarder(dataHandler, telegramHandler, chatId);
  }
}