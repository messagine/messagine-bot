import Debug from 'debug';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_venue');

// TODO: Fix after telegraf v4 upgrade
const onVenueMessage = () => async (ctx: any) => {
  debug('Triggered "on_venue" message.');

  const chatId = getChatId(ctx);
  const messageVenue = ctx.message?.venue;
  if (!messageVenue) {
    throw new MessageTypeNotFoundError(chatId, 'venue');
  }

  const opponentChatId = await getOpponentChatId(chatId);
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
