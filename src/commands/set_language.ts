import { Context as TelegrafContext } from "telegraf";
import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'telegraf-inline-menu';
import { getChatId, mapLanguagesToRecords } from "../lib/common";
import { DataHandler } from '../lib/dataHandler';
import { ILanguage } from '../lib/models/Language';

async function language_menu_middleware() {
	const dataHandler = new DataHandler();
	const allLanguages = await dataHandler.getAllLanguages();
	const topLanguages = await dataHandler.getFavLanguages();

	const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate(allLanguages);
  const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(topLanguages, allLanguagesMenuTemplate);

  const languageMenuMiddleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
	return languageMenuMiddleware
}

function getTopLanguagesMenuTemplate(languages: ILanguage[], allLanguagesMenuTemplate: MenuTemplate<TelegrafContext>) {
	const languageRecords = mapLanguagesToRecords(languages);
	const menuTemplate = new MenuTemplate<TelegrafContext>(ctx => `Choose new language.`)
  menuTemplate.choose('topLanguages', languageRecords, {
  	columns: 2,
		do: async (context, key) => await languageSelected(context, key, languageRecords),
  	buttonText: (context, key) => languageRecords[key]
  });
  menuTemplate.chooseIntoSubmenu('topLanguages', ['Show All >>'], allLanguagesMenuTemplate)
	return menuTemplate;
}

function getAllLanguagesMenuTemplate(languages: ILanguage[]) {
	const languageRecords = mapLanguagesToRecords(languages);
  const menuTemplate = new MenuTemplate<TelegrafContext>(ctx => `Showing all languages.`)
  menuTemplate.choose('allLanguages', languageRecords, {
  	columns: 2,
		maxRows: 100,
		do: async (context, key) => await languageSelected(context, key, languageRecords),
  	buttonText: (context, key) => languageRecords[key]
  });
  menuTemplate.manualRow(createBackMainMenuButtons('<< Show Top 10', '<< Show Top 10'))
	return menuTemplate;
}

async function languageSelected(context: TelegrafContext, languageCode: string, languageRecords: Record<string, string>) {
	const dataHandler = new DataHandler();
	const chatId = getChatId(context);
	await dataHandler.setLanguage(chatId, languageCode);
	await context.answerCbQuery(`${languageRecords[languageCode]} selected.`)
	return false
}

export {
  language_menu_middleware
}