import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:on_contact');

// TODO: Fix after telegraf v4 upgrade
const on_contact = () => async (ctx: any) => {
	debug('Triggered "on_contact" command');

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const messageContact = ctx.message?.contact;
	if (!messageContact) {
		debug('Message contact not found.');
		return await ctx.reply('Message contact not found.');
	}

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.tg.sendContact(
			opponentChatId,
			messageContact.phone_number,
			messageContact.first_name,
			messageContact,
		);
		opponentPromises.push(opponentPromise);
	});
	return await Promise.all(opponentPromises);
};

export { on_contact };
