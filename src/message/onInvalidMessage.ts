import { IMessagineContext } from '../lib/common';
import { eventTypeEnum } from '../lib/enums';
import { invalidInputReply } from '../reply';

const onInvalidMessage = (type: string) => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.invalid.${type}`);
  const sendMessagePromise = invalidInputReply(ctx);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onInvalidMessage };
