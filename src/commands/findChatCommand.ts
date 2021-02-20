import { getChatId, IMessagineContext } from '../lib/common';
import { addToLobby, createChat, findOpponentInLobby, leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { activeChatReply, chatStartReply, chatStartToOpponent, lobbyWaitReply, userNotFoundReply } from '../reply';

const findChatCommand = () => (ctx: IMessagineContext) => {
  return onFindChat(ctx);
};

const findChatAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onFindChat(ctx), ctx.answerCbQuery()]);
};

async function onFindChat(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);

  if (ctx.userState === userStateEnum.lobby) {
    await lobbyWaitReply(ctx);
    return;
  }

  if (ctx.userState === userStateEnum.chat) {
    await activeChatReply(ctx);
    return;
  }

  const user = ctx.user;
  if (!user) {
    await userNotFoundReply(ctx);
    return;
  }

  const chatId = getChatId(ctx);
  const opponent = await findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = leaveLobby(opponent.chatId);
    const createChatPromise = createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = chatStartReply(ctx);
    const chatStartToOpponentUserPromise = chatStartToOpponent(ctx, opponent.chatId);

    return Promise.all([
      leaveCurrentUserLobbyPromise,
      leaveOpponentUserLobbyPromise,
      createChatPromise,
      chatStartToCurrentUserPromise,
      chatStartToOpponentUserPromise,
    ]);
  } else {
    const addToLobbyPromise = addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = lobbyWaitReply(ctx);

    return Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
}

export { findChatAction, findChatCommand };
