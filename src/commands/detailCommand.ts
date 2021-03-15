import { checkAdmin, getFloatFromInput, getChatIdInfo, IMessagineContext } from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';

const detailCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.detail}`);
  return Promise.all([mixPanelPromise, onDetail(ctx)]);
};

async function onDetail(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const chatId = getFloatFromInput(ctx);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return ctx.reply(ctx.i18n.t('user_not_found'));
  }

  return ctx.reply(
    ctx.i18n.t('detail_reply', {
      banned: chatIdInfo.user.banned === true,
      blocked: chatIdInfo.user.blocked === true,
      languageCode: chatIdInfo.user.languageCode,
      state: chatIdInfo.state,
    }),
  );
}

export { detailCommand };
