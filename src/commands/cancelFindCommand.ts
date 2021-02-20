import { getChatId, IMessagineContext } from '../lib/common';
import { leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { cancelFindReply } from '../reply';

const cancelFindCommand = () => (ctx: IMessagineContext) => {
  return onCancelFind(ctx);
};

const cancelFindAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onCancelFind(ctx), ctx.answerCbQuery()]);
};

async function onCancelFind(ctx: IMessagineContext) {
  await ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.cancelFind}`);
  const chatId = getChatId(ctx);
  if (ctx.userState !== userStateEnum.lobby) {
    await ctx.reply(ctx.i18n.t('cancel_find_not_lobby'));
    return;
  }

  const leaveLobbyPromise = leaveLobby(chatId);
  const cancelFindPromise = cancelFindReply(ctx);

  return Promise.all([leaveLobbyPromise, cancelFindPromise]);
}

export { cancelFindAction, cancelFindCommand };
