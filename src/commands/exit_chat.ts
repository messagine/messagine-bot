import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getOpponentChatIds } from '../lib/common';
import { deleteChat, createPreviousChat } from '../lib/dataHandler';

const debug = require('debug')('bot:exit_chat_command');

const exit_chat = () => async (ctx: TelegrafContext) => {
	debug(`Triggered "exit_chat" command.`);
	const chatId = getChatId(ctx);

	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const sendMessagePromise = ctx.reply('You have closed the conversation.');
	const deleteChatPromise = deleteChat(existingChat.id);
	const previousChatCreatePromise = createPreviousChat(
		existingChat.chatIds,
		existingChat.languageCode,
		chatId,
		existingChat.startDate,
	);

	const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
	opponentChatIds.forEach(opponentChatId => {
		promises.push(
			ctx.telegram.sendMessage(
				opponentChatId,
				'Conversation closed by opponent. To find new chat, type /find_chat command.',
			),
		);
	});

	return Promise.all(promises);
};

export { exit_chat };
