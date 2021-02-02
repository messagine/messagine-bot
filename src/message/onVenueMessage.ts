import Debug from 'debug';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_venue');

// TODO: Fix after telegraf v4 upgrade
const onVenueMessage = () => async (ctx: any) => {
  debug('Triggered "on_venue" message.');

  const chatId = getChatId(ctx);
  const messageVenue = ctx.message?.venue;
  if (!messageVenue) {
    throw new MessageTypeNotFoundError(chatId, 'venue');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendVenue(
      opponentChatId,
      messageVenue.location.latitude,
      messageVenue.location.longitude,
      messageVenue.title,
      messageVenue.address,
      messageVenue.foursquare_id,
      messageVenue.foursquare_type,
    );
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onVenueMessage };
