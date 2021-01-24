import { TelegrafContext } from 'telegraf/typings/context';
import _ from 'lodash';
import config from '../config';
import { IChat } from './models/Chat';
import { ILanguage } from './models/Language';
import * as languageFile from '../../languages.json';
import { findExistingChat } from './dataHandler';
import { Contact, PhotoSize, Video, Document, Location, Sticker } from 'telegraf/typings/telegram-types';

const debug = require('debug')('common');

export function getChatId(ctx: TelegrafContext): number {
	const chatId = ctx.chat?.id;
	if (chatId) {
		return chatId;
	} else {
		ctx.reply('Chat Id not found. Check your security settings.');
		debug('Chat Id not found.');
		throw new Error('Invalid chat id.');
	}
}

export function getMessageText(ctx: TelegrafContext): string {
	const messageText = ctx.message?.text;
	if (messageText) {
		return messageText;
	} else {
		ctx.reply('Message text not found.');
		debug('Message text not found.');
		throw new Error('Invalid text.');
	}
}

export function getMessagePhoto(ctx: TelegrafContext): PhotoSize {
	const messagePhoto = ctx.message?.photo;
	if (messagePhoto) {
		const photoSize = messagePhoto.length;
		const biggestPhoto = messagePhoto[photoSize - 1];
		return biggestPhoto;
	} else {
		ctx.reply('Message photo not found.');
		debug('Message photo not found.');
		throw new Error('Invalid photo.');
	}
}

export function getMessageVideo(ctx: TelegrafContext): Video {
	const messageVideo = ctx.message?.video;
	if (messageVideo) {
		return messageVideo;
	} else {
		ctx.reply('Message video not found.');
		debug('Message video not found.');
		throw new Error('Invalid video.');
	}
}

export function getMessageContact(ctx: TelegrafContext): Contact {
	const messageContact = ctx.message?.contact;
	if (messageContact) {
		return messageContact;
	} else {
		ctx.reply('Message contact not found.');
		debug('Message contact not found.');
		throw new Error('Invalid contact.');
	}
}

export function getMessageDocument(ctx: TelegrafContext): Document {
	const messageDocument = ctx.message?.document;
	if (messageDocument) {
		return messageDocument;
	} else {
		ctx.reply('Message document not found.');
		debug('Message document not found.');
		throw new Error('Invalid document.');
	}
}

export function getMessageLocation(ctx: TelegrafContext): Location {
	const messageLocation = ctx.message?.location;
	if (messageLocation) {
		return messageLocation;
	} else {
		ctx.reply('Message location not found.');
		debug('Message location not found.');
		throw new Error('Invalid location.');
	}
}

export function getMessageSticker(ctx: TelegrafContext): Sticker {
	const messageSticker = ctx.message?.sticker;
	if (messageSticker) {
		return messageSticker;
	} else {
		ctx.reply('Message sticker not found.');
		debug('Message sticker not found.');
		throw new Error('Invalid sticker.');
	}
}

export function getLanguageCode(ctx: TelegrafContext): string {
	const language_code = ctx.from?.language_code;
	if (language_code) {
		return language_code;
	} else {
		debug('Language code not found.');
		return config.DEFAULT_LANGUAGE_CODE;
	}
}

export function getOpponentChatIds(chat: IChat, chatId: number): number[] {
	const chatIds = chat.chatIds;
	const opponentChatIds = chatIds.filter(id => chatId !== id);
	return opponentChatIds;
}

export function mapLanguagesToRecords(languages: ILanguage[]): Record<string, string> {
	return languages.reduce(function (map, obj) {
		map[obj.lang] = obj.name;
		return map;
	}, {});
}

export function getAllLanguages(): ILanguage[] {
	const languages: ILanguage[] = languageFile;
	const validLanguages = _.filter(languages, l => l.name !== undefined);
	const sortedTopLanguages = _.sortBy(validLanguages, l => l.name);
	return sortedTopLanguages;
}

export function getTopLanguages(): ILanguage[] {
	const languages: ILanguage[] = languageFile;
	const favLanguages = _.filter(languages, l => l.fav_order !== undefined);
	const sortedTopLanguages = _.sortBy(favLanguages, l => l.fav_order);
	return sortedTopLanguages;
}

export async function findExistingChatSafe(ctx: TelegrafContext): Promise<IChat> {
	const chatId = getChatId(ctx);
	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
		debug("Chat doesn't exist.");
		throw new Error("Chat doesn't exist.");
	}
	return existingChat;
}
