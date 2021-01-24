import { TelegrafContext } from 'telegraf/typings/context';
import _ from 'lodash';
import config from '../config';
import { IChat } from './models/Chat';
import { ILanguage } from './models/Language';
import * as languageFile from '../../languages.json';

const debug = require('debug')('common');

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
	return languages.reduce(function (map: { [key: string]: string }, obj: ILanguage) {
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
