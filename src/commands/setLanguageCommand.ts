import { createBackMainMenuButtons, MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import { Message } from 'telegraf/typings/telegram-types';
import {
  findLanguageSafe,
  getAllLanguages,
  getChatId,
  getTopLanguages,
  IMessagineContext,
  mapLanguagesToRecords,
} from '../lib/common';
import { findExistingChat, findLobby, setLanguage } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { ILanguage } from '../lib/models/Language';

const setLanguageCommand = (languageMenu: MenuMiddleware<IMessagineContext>) => (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.setLanguage}`);
  return languageMenu.replyToContext(ctx);
};

// TODO: context geçir, localization ayarla
function languageMenuMiddleware() {
  const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate();
  const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(allLanguagesMenuTemplate);

  const middleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
  return middleware;
}

function getTopLanguagesMenuTemplate(allLanguagesMenuTemplate: MenuTemplate<IMessagineContext>) {
  const languages = getTopLanguages();
  const menuTemplate = generateMenuTemplate('topLanguages', 'Top Languages', languages);
  menuTemplate.chooseIntoSubmenu('topLanguages', ['All >>'], allLanguagesMenuTemplate);
  return menuTemplate;
}

function getAllLanguagesMenuTemplate() {
  const languages = getAllLanguages();
  const menuTemplate = generateMenuTemplate('allLanguages', 'All Languages', languages);
  menuTemplate.manualRow(createBackMainMenuButtons('<< Top', '<< Top'));
  return menuTemplate;
}

function generateMenuTemplate(actionPrefix: string, title: string, languages: ILanguage[]) {
  const menuTemplate = new MenuTemplate<IMessagineContext>(() => title);
  const languageRecords = mapLanguagesToRecords(languages);
  menuTemplate.choose(actionPrefix, languageRecords, {
    // tslint:disable-next-line: variable-name
    buttonText: (_ctx, key) => languageRecords[key],
    columns: 2,
    do: async (context, key) => {
      const language = findLanguageSafe(context, key);
      await languageSelected(context, language);
      return false;
    },
    maxRows: 100,
  });
  return menuTemplate;
}

async function getReplyPromise(ctx: IMessagineContext, selectedLanguage: string): Promise<Message> {
  const chatId = getChatId(ctx);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);
  const checkResults = await Promise.all([lobbyPromise, existingChatPromise]);

  const lobby = checkResults[0];
  const existingChat = checkResults[1];

  if (lobby) {
    return ctx.reply(
      ctx.i18n.t('language_selected_lobby', {
        cancelFindCommand: commandEnum.cancelFind,
        findChatCommand: commandEnum.findChat,
        selectedLanguage,
      }),
    );
  }
  if (existingChat) {
    return ctx.reply(
      ctx.i18n.t('language_selected_chat', {
        exitChatCommand: commandEnum.exitChat,
        findChatCommand: commandEnum.findChat,
        selectedLanguage,
      }),
    );
  }
  return ctx.reply(
    ctx.i18n.t('language_selected_idle', {
      findChatCommand: commandEnum.findChat,
      selectedLanguage,
    }),
  );
}

async function languageSelected(ctx: IMessagineContext, language: ILanguage) {
  const chatId = getChatId(ctx);
  ctx.i18n.locale(language.lang);
  ctx.mixpanel.people.set({ language_code: language.lang });
  const setLanguagePromise = setLanguage(chatId, language.lang);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = getReplyPromise(ctx, language.native_name);
  const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { languageMenuMiddleware, setLanguageCommand };
