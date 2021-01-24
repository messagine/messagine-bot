import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:on_video');

const on_video = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_video" command');

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const messageVideo = ctx.message?.video;
	if (!messageVideo) {
		debug('Message video not found.');
		return await ctx.reply('Message video not found.');
	}

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.tg.sendPhoto(opponentChatId, messageVideo.file_id);
		opponentPromises.push(opponentPromise);
	});
	return await Promise.all(opponentPromises);
};

export { on_video };
