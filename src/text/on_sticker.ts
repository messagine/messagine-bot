import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessageSticker, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_sticker');

const on_sticker = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_sticker" command');

	const chatId = getChatId(ctx);
	const messageSticker = getMessageSticker(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendMessage(opponentChatId, messageSticker.file_id);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_sticker };
