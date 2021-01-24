import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:on_location');

const on_location = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_location" command');

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const messageLocation = ctx.message?.location;
	if (!messageLocation) {
		debug('Message location not found.');
		return await ctx.reply('Message location not found.');
	}

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

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
	return await Promise.all(opponentPromises);
};

export { on_location };
