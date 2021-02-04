import { IMessagineContext } from '../lib/common';
import { eventTypeEnum } from '../lib/enums';

const onInvalidMessage = (type: string) => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.invalid.${type}`);
  return await ctx.reply(ctx.i18n.t('invalid_input'));
};

export { onInvalidMessage };
