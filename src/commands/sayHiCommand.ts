import { getOpponentChatId, IMessagineContext } from '../lib/common';
import { actionEnum, eventTypeEnum } from '../lib/enums';
import { hiSendReply, sayHiReply } from '../reply';

const sayHiAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.sayHi}`);
  const opponentChatId = getOpponentChatId(ctx);

  const hiSendPromise = hiSendReply(ctx);
  const sayHiPromise = sayHiReply(ctx, opponentChatId);

  return Promise.all([mixPanelPromise, ctx.deleteMessage(), ctx.answerCbQuery(), hiSendPromise, sayHiPromise]);
};

export { sayHiAction };
