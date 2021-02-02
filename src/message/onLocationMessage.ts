import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_location');

const onLocationMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_location" message.');

  const chatId = getChatId(ctx);
  const messageLocation = ctx.message?.location;
  if (!messageLocation) {
    throw new MessageTypeNotFoundError(chatId, 'location');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendLocation(opponentChatId, messageLocation.latitude, messageLocation.longitude);
};

export { onLocationMessage };
