import { TelegrafContext } from "telegraf/typings/context";
import { getChatId } from "../lib/common";
import { DataHandler } from "../lib/dataHandler";

const debug = require("debug")("bot:find_chat_command");

const find_chat = () => async (ctx: TelegrafContext) => {
	debug(`Triggered "find_chat" command.`);
  const dataHandler = new DataHandler();
  const chatId = getChatId(ctx);

  const lobbyPromise = dataHandler.findLobby(chatId);
  const existingChatPromise = dataHandler.findExistingChat(chatId);
  const userPromise = dataHandler.getUser(chatId);
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

  const opponent = await dataHandler.findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const chatStartMessage = 'Chat started. You can exit chat via /exit_chat command. Have fun.';

    const leaveCurrentUserLobbyPromise = dataHandler.leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = dataHandler.leaveLobby(opponent.chatId);
    const createChatPromise = dataHandler.createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = ctx.reply(chatStartMessage);
    const chatStartToOpponentUserPromise = ctx.telegram.sendMessage(opponent.chatId, chatStartMessage);

    await Promise.all([leaveCurrentUserLobbyPromise, leaveOpponentUserLobbyPromise, createChatPromise, chatStartToCurrentUserPromise, chatStartToOpponentUserPromise]);
  } else {
    const addToLobbyPromise = dataHandler.addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = ctx.reply('Waiting in the lobby. You can exit lobby via /cancel_find command.');

    await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
};

export { find_chat };
