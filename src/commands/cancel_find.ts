import { TelegrafContext } from 'telegraf/typings/context';
import { getChatId } from '../lib/common';
import { leaveLobby } from '../lib/dataHandler';

const cancel_find = () => async (ctx: TelegrafContext) => {
	const chatId = getChatId(ctx);
	const leaveLobbyPromise = leaveLobby(chatId);
	const leftMessagePromise = ctx.reply('Find chat cancelled. To find new chat, type /find_chat command.');

	await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancel_find };
