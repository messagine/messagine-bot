import { checkAdmin, getInputUserInfoSafe, IMessagineContext } from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';

const detailCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.detail}`);
  return Promise.all([mixPanelPromise, onDetail(ctx)]);
};

async function onDetail(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const inputUserInfo = await getInputUserInfoSafe(ctx);

  return ctx.reply(
    ctx.i18n.t('detail_reply', {
      banned: inputUserInfo.user.banned === true,
      blocked: inputUserInfo.user.blocked === true,
      languageCode: inputUserInfo.user.languageCode,
      lastActivity: inputUserInfo.user.lastActivity,
      state: inputUserInfo.state,
    }),
  );
}

export { detailCommand };
