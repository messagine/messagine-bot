import { getChatId, IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { cancelFindNotLobbyReply, cancelFindReply } from '../reply';

const cancelFindCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.cancelFind}`);
  return Promise.all([mixPanelPromise, onCancelFind(ctx)]);
};

const cancelFindAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.cancelFind}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onCancelFind(ctx), ctx.answerCbQuery()]);
};

function onCancelFind(ctx: IMessagineContext) {
  const chatId = getChatId(ctx);
  if (ctx.userState !== userStateEnum.lobby) {
    return cancelFindNotLobbyReply(ctx);
  }

  const leaveLobbyPromise = ctx.db.leaveLobby(chatId);
  const cancelFindPromise = cancelFindReply(ctx);

  return Promise.all([leaveLobbyPromise, cancelFindPromise]);
}

export { cancelFindAction, cancelFindCommand };
