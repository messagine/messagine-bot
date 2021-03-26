import { checkAdmin, getInputUserInfoSafe, IMessagineContext } from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';

const unbanCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.unban}`);
  return Promise.all([mixPanelPromise, onUnban(ctx)]);
};

async function onUnban(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const inputUserInfo = await getInputUserInfoSafe(ctx);

  const userBanPromise = ctx.db.userBannedChange(inputUserInfo.chatId, false);
  const replyPromise = ctx.reply(ctx.i18n.t('unban_reply'));

  return Promise.all([userBanPromise, replyPromise]);
}

export { unbanCommand };
