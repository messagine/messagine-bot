import { Context as TelegrafContext } from 'telegraf';
import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'telegraf-inline-menu';
import { mapLanguagesToRecords, getAllLanguages, getTopLanguages } from '../lib/common';
import { setLanguage } from '../lib/dataHandler';

const debug = require('debug')('bot:set_language');

function language_menu_middleware() {
	const allLanguagesMenuTemplate = getAllLanguagesMenuTemplate();
	const topLanguagesMenuTemplate = getTopLanguagesMenuTemplate(allLanguagesMenuTemplate);

	const languageMenuMiddleware = new MenuMiddleware('/', topLanguagesMenuTemplate);
	return languageMenuMiddleware;
}

function getTopLanguagesMenuTemplate(allLanguagesMenuTemplate: MenuTemplate<TelegrafContext>) {
	const languages = getTopLanguages();
	const languageRecords = mapLanguagesToRecords(languages);
	const menuTemplate = new MenuTemplate<TelegrafContext>(() => `Choose new language.`);
	menuTemplate.choose('topLanguages', languageRecords, {
		columns: 2,
		do: async (context, key) => {
			await languageSelected(context, key, languageRecords);
			return false;
		},
		buttonText: (_context, key) => languageRecords[key],
	});
	menuTemplate.chooseIntoSubmenu('topLanguages', ['Show All >>'], allLanguagesMenuTemplate);
	return menuTemplate;
}

function getAllLanguagesMenuTemplate() {
	const languages = getAllLanguages();
	const languageRecords = mapLanguagesToRecords(languages);
	const menuTemplate = new MenuTemplate<TelegrafContext>(() => `Showing all languages.`);
	menuTemplate.choose('allLanguages', languageRecords, {
		columns: 2,
		maxRows: 100,
		do: async (context, key) => {
			await languageSelected(context, key, languageRecords);
			return false;
		},
		buttonText: (_context, key) => languageRecords[key],
	});
	menuTemplate.manualRow(createBackMainMenuButtons('<< Show Top 10', '<< Show Top 10'));
	return menuTemplate;
}

async function languageSelected(
	context: TelegrafContext,
	languageCode: string,
	languageRecords: Record<string, string>,
) {
	const chatId = context.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		await context.reply('Chat Id not found. Check your security settings.');
		return;
	}

	const setLanguagePromise = setLanguage(chatId, languageCode);
	const answerQueryPromise = context.answerCbQuery();
	const replyPromise = context.reply(`${languageRecords[languageCode]} selected.`);
	const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
	await Promise.all(promises);
}

export { language_menu_middleware };
