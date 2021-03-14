import { getChatIdInfo, IMessagineContext } from '../lib/common';
import { userBannedChange } from '../lib/dataHandler';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { invalidInputReply } from '../reply';

const unbanCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.unban}`);
  return Promise.all([mixPanelPromise, onUnban(ctx)]);
};

async function onUnban(ctx: IMessagineContext) {
  if (!ctx.user?.admin) {
    return;
  }
  if (ctx?.match === undefined || ctx?.match?.length !== 2) {
    return invalidInputReply(ctx);
  }

  const chatId = parseFloat(ctx.match[1]);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return ctx.reply(ctx.i18n.t('user_not_found'));
  }

  const userBanPromise = userBannedChange(chatId, false);
  const replyPromise = ctx.reply(ctx.i18n.t('unban_reply'));

  return Promise.all([userBanPromise, replyPromise]);
}

export { unbanCommand };
