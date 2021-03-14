import _ from 'lodash';
import { TelegrafContext } from 'telegraf/typings/context';
import * as languageFile from '../../languages.json';
import config from '../config';
import {
  ChatIdNotFoundError,
  ChatNotExistIdleError,
  ChatNotExistInLobbyError,
  InvalidNumberOfOpponentError,
} from '../error';
import { LanguageNotFoundError } from '../error/LanguageNotFoundError';
import { createPreviousChat, deleteChat, findExistingChat, findLobby, getUser } from './dataHandler';
import { userStateEnum } from './enums';
import { IChat } from './models/Chat';
import { ILanguage } from './models/Language';
import { ILobby } from './models/Lobby';
import { IUser } from './models/User';

export function getLanguage(ctx: IMessagineContext): ILanguage {
  const languageCode = ctx.from?.language_code || config.DEFAULT_LANGUAGE_CODE;
  const language = findLanguage(languageCode);
  if (!language) {
    return findLanguageSafe(ctx, config.DEFAULT_LANGUAGE_CODE);
  } else {
    return language;
  }
}

export function findLanguage(code: string) {
  const languages: ILanguage[] = languageFile;
  return _.find(languages, l => l.lang === code);
}

export function findLanguageSafe(ctx: IMessagineContext, code: string) {
  const chatId = getChatId(ctx);
  const language = findLanguage(code);
  if (!language) {
    throw new LanguageNotFoundError(ctx, chatId, code);
  }
  return language;
}

export function extractOpponentChatId(ctx: IMessagineContext, chat: IChat): number {
  const chatId = getChatId(ctx);
  return extractOpponentForChatId(ctx, chatId, chat);
}

export function extractOpponentForChatId(ctx: IMessagineContext, chatId: number, chat: IChat): number {
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
  return _.sortBy(validLanguages, l => l.lang);
}

export function getTopLanguages(): ILanguage[] {
  const languages: ILanguage[] = languageFile;
  const favLanguages = _.filter(languages, l => l.fav_order !== undefined);
  return _.sortBy(favLanguages, l => l.fav_order);
}

export function getChatId(ctx: IMessagineContext): number {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    throw new ChatIdNotFoundError(ctx);
  }
  return chatId;
}

export function getExistingChat(ctx: IMessagineContext): IChat {
  const chatId = getChatId(ctx);
  const existingChat = ctx.currentChat;
  if (!existingChat) {
    if (ctx.lobby) {
      throw new ChatNotExistInLobbyError(ctx, chatId);
    } else {
      throw new ChatNotExistIdleError(ctx, chatId);
    }
  }
  return existingChat;
}

export function getOpponentChatId(ctx: IMessagineContext): number {
  const existingChat = getExistingChat(ctx);
  return extractOpponentChatId(ctx, existingChat);
}

export async function getChatIdInfo(chatId: number) {
  const userPromise = getUser(chatId);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);

  const checkResults = await Promise.all([userPromise, lobbyPromise, existingChatPromise]);

  const user = checkResults[0];
  const lobby = checkResults[1];
  const chat = checkResults[2];

  let state: string;
  if (lobby) {
    state = userStateEnum.lobby;
  } else if (chat) {
    state = userStateEnum.chat;
  } else {
    state = userStateEnum.idle;
  }

  return {
    chat,
    lobby,
    state,
    user,
  };
}

export function moveChatToPreviousChats(chat: IChat, closedBy: number) {
  const deleteChatPromise = deleteChat(chat.id);
  const previousChatCreatePromise = createPreviousChat(chat, closedBy);
  return Promise.all([deleteChatPromise, previousChatCreatePromise]);
}

export interface IMessagineContext extends TelegrafContext {
  i18n?: any;
  mixpanel?: any;
  user?: IUser;
  userState?: string;
  lobby?: ILobby;
  currentChat?: IChat;
}
