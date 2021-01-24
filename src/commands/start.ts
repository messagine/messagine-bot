import { TelegrafContext } from 'telegraf/typings/context';
import { getChatId, getLanguageCode } from '../lib/common';
import { DataHandler } from '../lib/dataHandler';

const debug = require('debug')('bot:start_command');

const start = () => async (ctx: TelegrafContext) => {
	let dataHandler = new DataHandler();
	const chatId = getChatId(ctx);
	const languageCode = getLanguageCode(ctx);
	let user = await dataHandler.getUser(chatId);
	if (!user) {
		debug(`Triggered "start" command with message.`);
		user = await dataHandler.addUser(chatId, languageCode);
		return ctx.reply(
			`Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${languageCode}, to change your language type /set_language.`,
		);
	} else {
		return ctx.reply('Welcome back. To find new chat, type /find_chat command.');
	}
};

export { start };
