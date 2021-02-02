import { Context as TelegrafContext } from 'telegraf';
import { createBackMainMenuButtons, MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import { getAllLanguages, getChatId, getTopLanguages, mapLanguagesToRecords } from '../lib/common';
import { setLanguage } from '../lib/dataHandler';

const setLanguageCommand = (languageMenu: MenuMiddleware<TelegrafContext>) => (ctx: TelegrafContext) => {
  return languageMenu.replyToContext(ctx);
};

function languageMenuMiddleware() {
  const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate();
  const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(allLanguagesMenuTemplate);

  const middleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
  return middleware;
}

function getTopLanguagesMenuTemplate(allLanguagesMenuTemplate: MenuTemplate<TelegrafContext>) {
  const languages = getTopLanguages();
  const languageRecords = mapLanguagesToRecords(languages);
  const menuTemplate = new MenuTemplate<TelegrafContext>(() => `Choose new language.`);
  menuTemplate.choose('topLanguages', languageRecords, {
    buttonText: (_, key) => languageRecords[key],
    columns: 2,
    do: async (context, key) => {
      await languageSelected(context, key, languageRecords);
      return false;
    },
  });
  menuTemplate.chooseIntoSubmenu('topLanguages', ['Show All >>'], allLanguagesMenuTemplate);
  return menuTemplate;
}

function getAllLanguagesMenuTemplate() {
  const languages = getAllLanguages();
  const languageRecords = mapLanguagesToRecords(languages);
  const menuTemplate = new MenuTemplate<TelegrafContext>(() => `Showing all languages.`);
  menuTemplate.choose('allLanguages', languageRecords, {
    buttonText: (_, key) => languageRecords[key],
    columns: 2,
    do: async (context, key) => {
      await languageSelected(context, key, languageRecords);
      return false;
    },
    maxRows: 100,
  });
  menuTemplate.manualRow(createBackMainMenuButtons('<< Show Top 10', '<< Show Top 10'));
  return menuTemplate;
}

async function languageSelected(ctx: TelegrafContext, languageCode: string, languageRecords: Record<string, string>) {
  const chatId = getChatId(ctx);
  const setLanguagePromise = setLanguage(chatId, languageCode);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = ctx.reply(`${languageRecords[languageCode]} selected.`);
  const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { languageMenuMiddleware, setLanguageCommand };
