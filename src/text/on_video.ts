import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessageVideo, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_video');

const on_video = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_video" command');

	const chatId = getChatId(ctx);
	const messageVideo = getMessageVideo(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendPhoto(opponentChatId, messageVideo.file_id);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_video };
