import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:on_document');

const on_document = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_document" command');

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const messageDocument = ctx.message?.document;
	if (!messageDocument) {
		debug('Message document not found.');
		return await ctx.reply('Message document not found.');
	}

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.tg.sendMessage(opponentChatId, messageDocument.file_id);
		opponentPromises.push(opponentPromise);
	});
	return await Promise.all(opponentPromises);
};

export { on_document };
