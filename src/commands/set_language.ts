import { Context as TelegrafContext } from 'telegraf';
import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'telegraf-inline-menu';
import { getChatId, mapLanguagesToRecords, getAllLanguages, getTopLanguages } from '../lib/common';
import { DataHandler } from '../lib/dataHandler';

function language_menu_middleware() {
	const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate();
	const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(allLanguagesMenuTemplate);

	const languageMenuMiddleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
	return languageMenuMiddleware;
}

function getTopLanguagesMenuTemplate(allLanguagesMenuTemplate: MenuTemplate<TelegrafContext>) {
	const languages = getTopLanguages();
	const languageRecords = mapLanguagesToRecords(languages);
	const menuTemplate = new MenuTemplate<TelegrafContext>(ctx => `Choose new language.`);
	menuTemplate.choose('topLanguages', languageRecords, {
		columns: 2,
		do: async (context, key) => await languageSelected(context, key, languageRecords),
		buttonText: (context, key) => languageRecords[key],
	});
	menuTemplate.chooseIntoSubmenu('topLanguages', ['All'], allLanguagesMenuTemplate);
	return menuTemplate;
}

function getAllLanguagesMenuTemplate() {
	const languages = getAllLanguages();
	const languageRecords = mapLanguagesToRecords(languages);
	const menuTemplate = new MenuTemplate<TelegrafContext>(ctx => `Showing all languages.`);
	menuTemplate.choose('allLanguages', languageRecords, {
		columns: 2,
		maxRows: 100,
		do: async (context, key) => await languageSelected(context, key, languageRecords),
		buttonText: (context, key) => languageRecords[key],
	});
	menuTemplate.manualRow(createBackMainMenuButtons('<< Show Top 10', '<< Show Top 10'));
	return menuTemplate;
}

async function languageSelected(
	context: TelegrafContext,
	languageCode: string,
	languageRecords: Record<string, string>,
) {
	const dataHandler = new DataHandler();
	const chatId = getChatId(context);
	const setLanguagePromise = dataHandler.setLanguage(chatId, languageCode);
	const answerQueryPromise = context.answerCbQuery();
	const replyPromise = context.reply(`${languageRecords[languageCode]} selected.`);
	const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
	await Promise.all(promises);
	return false;
}

export { language_menu_middleware };
