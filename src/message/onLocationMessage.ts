import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onLocationMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.location}`);

  const chatId = getChatId(ctx);
  const messageLocation = ctx.message?.location;
  if (!messageLocation) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.location);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return await ctx.tg.sendLocation(opponentChatId, messageLocation.latitude, messageLocation.longitude);
};

export { onLocationMessage };
