import { createBackMainMenuButtons, MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import { Message } from 'telegraf/typings/telegram-types';
import config from '../config';
import {
  findLanguage,
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

  return new MenuMiddleware('/', topLanguagesMenuTemplate);
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
      await languageSelected(context, key);
      return false;
    },
    maxRows: 100,
  });
  return menuTemplate;
}

async function getReplyPromise(
  ctx: IMessagineContext,
  previousLanguage: string,
  selectedLanguage: string,
): Promise<Message> {
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
        previousLanguage,
        selectedLanguage,
      }),
    );
  }
  if (existingChat) {
    return ctx.reply(
      ctx.i18n.t('language_selected_chat', {
        exitChatCommand: commandEnum.exitChat,
        findChatCommand: commandEnum.findChat,
        previousLanguage,
        selectedLanguage,
      }),
    );
  }
  return ctx.reply(
    ctx.i18n.t('language_selected_idle', {
      findChatCommand: commandEnum.findChat,
      previousLanguage,
      selectedLanguage,
    }),
  );
}

async function languageSelected(ctx: IMessagineContext, newLanguageCode: string) {
  const chatId = getChatId(ctx);
  const previousLanguageCode = ctx.user?.languageCode || config.DEFAULT_LANGUAGE_CODE;

  if (previousLanguageCode === newLanguageCode) {
    await ctx.reply(ctx.i18n.t('language_not_changed'));
    return;
  }

  const previousLanguage = findLanguage(previousLanguageCode);
  const previousLanguageNativeName = previousLanguage ? previousLanguage.native_name : config.DEFAULT_LANGUAGE_NAME;
  const newLanguage = findLanguageSafe(ctx, newLanguageCode);

  ctx.i18n.locale(newLanguageCode);
  if (ctx.user) {
    ctx.user.languageCode = newLanguageCode;
  }
  ctx.mixpanel.people.set({ language_code: newLanguageCode });

  const setLanguagePromise = setLanguage(chatId, newLanguageCode);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = getReplyPromise(ctx, previousLanguageNativeName, newLanguage.native_name);
  const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { languageMenuMiddleware, setLanguageCommand };
