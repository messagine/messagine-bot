import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { deleteChat, createPreviousChat, findExistingChat } from '../lib/dataHandler';

const debug = require('debug')('bot:exit_chat_command');

const exit_chat = () => async (ctx: TelegrafContext) => {
	debug(`Triggered "exit_chat" command.`);

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const existingChat = await findExistingChat(chatId);
	if (!existingChat) {
		debug("Chat doesn't exist.");
		return await ctx.reply("Chat doesn't exist. To find new chat, type /find_chat command.");
	}

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const sendMessagePromise = ctx.reply('You have closed the conversation.');
	const deleteChatPromise = deleteChat(existingChat.id);
	const previousChatCreatePromise = createPreviousChat(existingChat, chatId);

	const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
	opponentChatIds.forEach(opponentChatId => {
		promises.push(
			ctx.tg.sendMessage(opponentChatId, 'Conversation closed by opponent. To find new chat, type /find_chat command.'),
		);
	});

	return await Promise.all(promises);
};

export { exit_chat };
