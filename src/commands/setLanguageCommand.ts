import { createBackMainMenuButtons, MenuMiddleware, MenuTemplate } from 'telegraf-inline-menu';
import { getAllLanguages, getChatId, getTopLanguages, IMessagineContext, mapLanguagesToRecords } from '../lib/common';
import { setLanguage } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const setLanguageCommand = (languageMenu: MenuMiddleware<IMessagineContext>) => (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.setLanguage}`);
  return languageMenu.replyToContext(ctx);
};

function languageMenuMiddleware() {
  const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate();
  const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(allLanguagesMenuTemplate);

  const middleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
  return middleware;
}

function getTopLanguagesMenuTemplate(allLanguagesMenuTemplate: MenuTemplate<IMessagineContext>) {
  const languages = getTopLanguages();
  const languageRecords = mapLanguagesToRecords(languages);
  const menuTemplate = generateMenuTemplate('topLanguages', 'Choose new language.', languageRecords);
  menuTemplate.chooseIntoSubmenu('topLanguages', ['Show All >>'], allLanguagesMenuTemplate);
  return menuTemplate;
}

function getAllLanguagesMenuTemplate() {
  const languages = getAllLanguages();
  const languageRecords = mapLanguagesToRecords(languages);
  const menuTemplate = generateMenuTemplate('allLanguages', 'Showing all languages.', languageRecords);
  menuTemplate.manualRow(createBackMainMenuButtons('<< Show Top 10', '<< Show Top 10'));
  return menuTemplate;
}

function generateMenuTemplate(actionPrefix: string, title: string, languageRecords: Record<string, string>) {
  const menuTemplate = new MenuTemplate<IMessagineContext>(() => title);
  menuTemplate.choose(actionPrefix, languageRecords, {
    buttonText: (_, key) => languageRecords[key],
    columns: 2,
    do: async (context, key) => {
      await languageSelected(context, key, languageRecords);
      return false;
    },
    maxRows: 100,
  });
  return menuTemplate;
}

async function languageSelected(ctx: IMessagineContext, languageCode: string, languageRecords: Record<string, string>) {
  const chatId = getChatId(ctx);
  const setLanguagePromise = setLanguage(chatId, languageCode);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = ctx.reply(`${languageRecords[languageCode]} selected.`);
  const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { languageMenuMiddleware, setLanguageCommand };
