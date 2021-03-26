import { getChatId, IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { activeChatReply, lobbyWaitReply, userNotFoundReply } from '../reply';

const findChatCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, onFindChat(ctx)]);
};

const findChatAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onFindChat(ctx), ctx.answerCbQuery()]);
};

function onFindChat(ctx: IMessagineContext) {
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

  const addToLobbyPromise = ctx.db.addToLobby(chatId, user.languageCode);
  const lobbyMessagePromise = lobbyWaitReply(ctx);

  return Promise.all([addToLobbyPromise, lobbyMessagePromise]);
}

export { findChatAction, findChatCommand };
