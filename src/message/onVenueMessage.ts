import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

// TODO: Fix after telegraf v4 upgrade
const onVenueMessage = () => (ctx: any) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.venue}`);

  const chatId = getChatId(ctx);
  const messageVenue = ctx.message?.venue;
  if (!messageVenue) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.venue);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const sendMessagePromise = ctx.tg.sendVenue(
    opponentChatId,
    messageVenue.location.latitude,
    messageVenue.location.longitude,
    messageVenue.title,
    messageVenue.address,
    messageVenue.foursquare_id,
    messageVenue.foursquare_type,
  );
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVenueMessage };
