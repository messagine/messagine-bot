import { InvalidInputError } from '../error';
import { IMessagineContext } from '../lib/common';
import { eventTypeEnum } from '../lib/enums';

const onInvalidMessage = (type: string) => async (ctx: IMessagineContext) => {
  await ctx.mixpanel.track(`${eventTypeEnum.message}.invalid.${type}`);
  throw new InvalidInputError(ctx);
};

export { onInvalidMessage };
