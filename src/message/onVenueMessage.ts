import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

// TODO: Fix after telegraf v4 upgrade
const onVenueMessage = () => async (ctx: any) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.venue}`);

  const chatId = getChatId(ctx);
  const messageVenue = ctx.message?.venue;
  if (!messageVenue) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.venue);
  }

  const opponentChatId = await getOpponentChatId(ctx);
  return await ctx.tg.sendVenue(
    opponentChatId,
    messageVenue.location.latitude,
    messageVenue.location.longitude,
    messageVenue.title,
    messageVenue.address,
    messageVenue.foursquare_id,
    messageVenue.foursquare_type,
  );
};

export { onVenueMessage };
