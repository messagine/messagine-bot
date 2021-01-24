import { TelegrafContext } from 'telegraf/typings/context';
import { leaveLobby } from '../lib/dataHandler';
const debug = require('debug')('bot:cancel_find');

const cancel_find = () => async (ctx: TelegrafContext) => {
	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const leaveLobbyPromise = leaveLobby(chatId);
	const leftMessagePromise = ctx.reply('Find chat cancelled. To find new chat, type /find_chat command.');

	return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancel_find };
