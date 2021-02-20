import { IMessagineContext } from '../lib/common';
import { actionEnum, eventTypeEnum } from '../lib/enums';

const deleteMessageAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.deleteMessage}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), ctx.answerCbQuery()]);
};

export { deleteMessageAction };
