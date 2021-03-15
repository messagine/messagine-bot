import { checkAdmin, getChatIdInfo, getFloatFromInput, IMessagineContext } from '../lib/common';
import { userBannedChange } from '../lib/dataHandler';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';

const unbanCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.unban}`);
  return Promise.all([mixPanelPromise, onUnban(ctx)]);
};

async function onUnban(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const chatId = getFloatFromInput(ctx);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return ctx.reply(ctx.i18n.t('user_not_found'));
  }

  const userBanPromise = userBannedChange(chatId, false);
  const replyPromise = ctx.reply(ctx.i18n.t('unban_reply'));

  return Promise.all([userBanPromise, replyPromise]);
}

export { unbanCommand };
