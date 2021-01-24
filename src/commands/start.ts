import { TelegrafContext } from 'telegraf/typings/context';
import { getLanguageCode } from '../lib/common';
import { getUser, addUser } from '../lib/dataHandler';

const debug = require('debug')('bot:start_command');

const start = () => async (ctx: TelegrafContext) => {
	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const languageCode = getLanguageCode(ctx);
	let user = await getUser(chatId);
	if (!user) {
		debug(`Triggered "start" command with message.`);
		const addUserPromise = addUser(chatId, languageCode);
		const replyPromise = ctx.reply(
			`Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${languageCode}, to change your language type /set_language.`,
		);
		return await Promise.all([addUserPromise, replyPromise]);
	} else {
		return await ctx.reply('Welcome back. To find new chat, type /find_chat command.');
	}
};

export { start };
