import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessageText, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_text');

const on_text = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_text" command');

	const chatId = getChatId(ctx);
	const messageText = getMessageText(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendMessage(opponentChatId, messageText);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_text };
