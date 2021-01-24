import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessagePhoto, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_photo');

const on_photo = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_photo" command');

	const chatId = getChatId(ctx);
	const messagePhoto = getMessagePhoto(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendPhoto(opponentChatId, messagePhoto.file_id);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_photo };
