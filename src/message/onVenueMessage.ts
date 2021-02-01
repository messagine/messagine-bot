import Debug from 'debug';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('message:on_venue');

// TODO: Fix after telegraf v4 upgrade
const onVenueMessage = () => async (ctx: any) => {
  debug('Triggered "on_venue" message.');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messageVenue = ctx.message?.venue;
  if (!messageVenue) {
    debug('Message venue not found.');
    return await ctx.reply('Message venue not found.');
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

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
