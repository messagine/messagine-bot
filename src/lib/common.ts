import _ from 'lodash';
import { TelegrafContext } from 'telegraf/typings/context';
import * as languageFile from '../../languages.json';
import config from '../config';
import { ChatIdNotFoundError, ChatNotExistError } from '../error';
import { findExistingChat } from './dataHandler';
import { IChat } from './models/Chat';
import { ILanguage } from './models/Language';

export function getLanguage(ctx: TelegrafContext): ILanguage {
  const languageCode = ctx.from?.language_code || config.DEFAULT_LANGUAGE_CODE;
  const languages: ILanguage[] = languageFile;
  const language = _.find(languages, l => l.lang === languageCode);
  if (!language) {
    throw new Error('Language not found.');
  }
  return language;
}

export function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

export function mapLanguagesToRecords(languages: ILanguage[]): Record<string, string> {
  return languages.reduce((map: { [key: string]: string }, obj: ILanguage) => {
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

export function getChatId(ctx: TelegrafContext): number {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    throw new ChatIdNotFoundError();
  }
  return chatId;
}

export async function getExistingChat(chatId: number): Promise<IChat> {
  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    throw new ChatNotExistError(chatId);
  }
  return existingChat;
}
