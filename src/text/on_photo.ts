import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:on_photo');

const on_photo = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_photo" command');

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const messagePhoto = ctx.message?.photo;
	if (!messagePhoto) {
		debug('Message photo not found.');
		return await ctx.reply('Message photo not found.');
	}

	const photoSize = messagePhoto.length;
	const biggestPhoto = messagePhoto[photoSize - 1];

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendPhoto(opponentChatId, biggestPhoto.file_id);
		opponentPromises.push(opponentPromise);
	});
	return await Promise.all(opponentPromises);
};

export { on_photo };
