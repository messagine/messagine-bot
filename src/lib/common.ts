import _ from 'lodash';
import { TelegrafContext } from 'telegraf/typings/context';
import * as languageFile from '../../languages.json';
import config from '../config';
import { ChatIdNotFoundError, ChatNotExistError, InvalidNumberOfOpponentError } from '../error';
import { findExistingChat } from './dataHandler';
import { IChat } from './models/Chat';
import { ILanguage } from './models/Language';
import { IUser } from './models/User';

export function getLanguage(ctx: IMessagineContext): ILanguage {
  const languageCode = ctx.from?.language_code || config.DEFAULT_LANGUAGE_CODE;
  const language = findLanguage(languageCode);
  if (!language) {
    const defaultLanguage = findLanguageSafe(config.DEFAULT_LANGUAGE_CODE);
    return defaultLanguage;
  } else {
    return language;
  }
}

export function findLanguage(code: string) {
  const languages: ILanguage[] = languageFile;
  return _.find(languages, l => l.lang === code);
}

export function findLanguageSafe(code: string) {
  const language = findLanguage(code);
  if (!language) {
    throw new Error('Language not found.');
  }
  return language;
}

export function extractOpponentChatId(ctx: IMessagineContext, chat: IChat, chatId: number): number {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  if (opponentChatIds.length !== 1) {
    throw new InvalidNumberOfOpponentError(ctx, chatId, opponentChatIds);
  }
  return opponentChatIds[0];
}

export function mapLanguagesToRecords(languages: ILanguage[]): Record<string, string> {
  return languages.reduce((map: { [key: string]: string }, obj: ILanguage) => {
    map[obj.lang] = obj.lang + ' - ' + obj.native_name;
    return map;
  }, {});
}

export function getAllLanguages(): ILanguage[] {
  const languages: ILanguage[] = languageFile;
  const validLanguages = _.filter(languages, l => l.lang !== undefined);
  const sortedTopLanguages = _.sortBy(validLanguages, l => l.lang);
  return sortedTopLanguages;
}

export function getTopLanguages(): ILanguage[] {
  const languages: ILanguage[] = languageFile;
  const favLanguages = _.filter(languages, l => l.fav_order !== undefined);
  const sortedTopLanguages = _.sortBy(favLanguages, l => l.fav_order);
  return sortedTopLanguages;
}

export function getChatId(ctx: IMessagineContext): number {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    throw new ChatIdNotFoundError(ctx);
  }
  return chatId;
}

export async function getExistingChat(ctx: IMessagineContext, chatId: number): Promise<IChat> {
  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    throw new ChatNotExistError(ctx, chatId);
  }
  return existingChat;
}

export async function getOpponentChatId(ctx: IMessagineContext, chatId: number): Promise<number> {
  const existingChat = await getExistingChat(ctx, chatId);
  const opponentChatId = extractOpponentChatId(ctx, existingChat, chatId);
  return opponentChatId;
}

export interface IMessagineContext extends TelegrafContext {
  i18n?: any;
  mixpanel?: any;
  user?: IUser;
}
