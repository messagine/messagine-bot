import { TelegrafContext } from 'telegraf/typings/context';
import {
	findLobby,
	findExistingChat,
	getUser,
	findOpponentInLobby,
	leaveLobby,
	createChat,
	addToLobby,
} from '../lib/dataHandler';

const debug = require('debug')('bot:find_chat_command');

const find_chat = () => async (ctx: TelegrafContext) => {
	debug(`Triggered "find_chat" command.`);

	const chatId = ctx.chat?.id;
	if (!chatId) {
		debug('Chat Id not found.');
		return await ctx.reply('Chat Id not found. Check your security settings.');
	}

	const lobbyPromise = findLobby(chatId);
	const existingChatPromise = findExistingChat(chatId);
	const userPromise = getUser(chatId);
	const checkResults = await Promise.all([lobbyPromise, existingChatPromise, userPromise]);

	const lobby = checkResults[0];
	if (lobby) {
		await ctx.reply('Waiting in the lobby. You can exit lobby via /cancel_find command.');
		return;
	}

	const existingChat = checkResults[1];
	if (existingChat) {
		await ctx.reply('You are in an active chat. To exit current chat type /exit_chat and try again.');
		return;
	}

	const user = checkResults[2];
	if (!user) {
		await ctx.reply('User not found. Type /start to initialize user.');
		return;
	}

	const opponent = await findOpponentInLobby(chatId, user.languageCode);

	if (opponent) {
		const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';

		const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
		const leaveOpponentUserLobbyPromise = leaveLobby(opponent.chatId);
		const createChatPromise = createChat(chatId, opponent.chatId, user.languageCode);
		const chatStartToCurrentUserPromise = ctx.reply(chatStartMessage);
		const chatStartToOpponentUserPromise = ctx.tg.sendMessage(opponent.chatId, chatStartMessage);

		return await Promise.all([
			leaveCurrentUserLobbyPromise,
			leaveOpponentUserLobbyPromise,
			createChatPromise,
			chatStartToCurrentUserPromise,
			chatStartToOpponentUserPromise,
		]);
	} else {
		const addToLobbyPromise = addToLobby(chatId, user.languageCode);
		const lobbyMessagePromise = ctx.reply('Waiting in the lobby. You can exit lobby via /cancel_find command.');

		return await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
	}
};

export { find_chat };
