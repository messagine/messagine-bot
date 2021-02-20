import { IMessagineContext } from '../lib/common';
import { eventTypeEnum } from '../lib/enums';

const onInvalidMessage = (type: string) => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.invalid.${type}`);
  const sendMessagePromise = ctx.reply(ctx.i18n.t('invalid_input'));
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onInvalidMessage };
