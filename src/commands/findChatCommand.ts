import { getChatId, IMessagineContext } from '../lib/common';
import { addToLobby, createChat, findOpponentInLobby, leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { activeChatReply, chatStartReply, lobbyWaitReply, userNotFoundReply } from '../reply';

const findChatCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, onFindChat(ctx)]);
};

const findChatAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onFindChat(ctx), ctx.answerCbQuery()]);
};

async function onFindChat(ctx: IMessagineContext) {
  if (ctx.userState === userStateEnum.lobby) {
    return lobbyWaitReply(ctx);
  }

  if (ctx.userState === userStateEnum.chat) {
    return activeChatReply(ctx);
  }

  const user = ctx.user;
  if (!user) {
    return userNotFoundReply(ctx);
  }

  const chatId = getChatId(ctx);
  const opponent = await findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = leaveLobby(opponent.chatId);
    const createChatPromise = createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = chatStartReply(ctx, chatId);
    const chatStartToOpponentUserPromise = chatStartReply(ctx, opponent.chatId);

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
