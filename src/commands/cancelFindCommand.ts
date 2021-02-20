import { getChatId, IMessagineContext } from '../lib/common';
import { findLobby, leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { cancelFindReply } from '../reply';

const cancelFindCommand = () => async (ctx: IMessagineContext) => {
  return await onCancelFind(ctx);
};

const cancelFindAction = () => (ctx: IMessagineContext) => {
  return Promise.all([
    ctx.deleteMessage(),
    onCancelFind(ctx),
    ctx.answerCbQuery(),
  ]);
};

async function onCancelFind(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.cancelFind}`);
  const chatId = getChatId(ctx);
  const lobby = await findLobby(chatId);
  if (!lobby) {
    await ctx.reply(ctx.i18n.t('cancel_find_not_lobby'));
    return;
  }

  const leaveLobbyPromise = leaveLobby(chatId);
  const cancelFindPromise = cancelFindReply(ctx);

  return await Promise.all([leaveLobbyPromise, cancelFindPromise]);
}

export { cancelFindAction, cancelFindCommand };
