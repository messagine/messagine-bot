import { getChatIdInfo, IMessagineContext } from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { invalidInputReply, userNotFoundReply } from '../reply';

const detailCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.detail}`);
  return Promise.all([mixPanelPromise, onDetail(ctx)]);
};

async function onDetail(ctx: IMessagineContext) {
  if (!ctx.user?.admin) {
    return;
  }
  if (ctx?.match === undefined || ctx?.match?.length !== 2) {
    return invalidInputReply(ctx);
  }

  const chatId = parseFloat(ctx.match[1]);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return userNotFoundReply(ctx);
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
