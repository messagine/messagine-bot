import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessageLocation, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_location');

const on_location = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_location" command');

	const chatId = getChatId(ctx);
	const messageLocation = getMessageLocation(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendLocation(
			opponentChatId,
			messageLocation.latitude,
			messageLocation.longitude,
		);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_location };
