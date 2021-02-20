import { getChatId, IMessagineContext } from '../lib/common';
import {
  addToLobby,
  createChat,
  findExistingChat,
  findLobby,
  findOpponentInLobby,
  leaveLobby,
} from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { activeChatReply, chatStartReply, chatStartToOpponent, lobbyWaitReply, userNotFoundReply } from '../reply';

const findChatCommand = () => async (ctx: IMessagineContext) => {
  return await onFindChat(ctx);
};

const findChatAction = () => (ctx: IMessagineContext) => {
  return Promise.all([
    ctx.deleteMessage(),
    onFindChat(ctx),
    ctx.answerCbQuery(),
  ]);
};

async function onFindChat(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);

  const chatId = getChatId(ctx);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);
  const checkResults = await Promise.all([lobbyPromise, existingChatPromise]);

  const lobby = checkResults[0];
  if (lobby) {
    await lobbyWaitReply(ctx);
    return;
  }

  const existingChat = checkResults[1];
  if (existingChat) {
    await activeChatReply(ctx);
    return;
  }

  const user = ctx.user;
  if (!user) {
    await userNotFoundReply(ctx);
    return;
  }

  const opponent = await findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = leaveLobby(opponent.chatId);
    const createChatPromise = createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = chatStartReply(ctx);
    const chatStartToOpponentUserPromise = chatStartToOpponent(ctx, opponent.chatId);

    return await Promise.all([
      leaveCurrentUserLobbyPromise,
      leaveOpponentUserLobbyPromise,
      createChatPromise,
      chatStartToCurrentUserPromise,
      chatStartToOpponentUserPromise,
    ]);
  } else {
    const addToLobbyPromise = addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = lobbyWaitReply(ctx);

    return await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
}

export { findChatAction, findChatCommand };
