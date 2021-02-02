import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_location');

const onLocationMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_location" message.');

  const chatId = getChatId(ctx);
  const messageLocation = ctx.message?.location;
  if (!messageLocation) {
    throw new MessageTypeNotFoundError(chatId, 'location');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendLocation(opponentChatId, messageLocation.latitude, messageLocation.longitude);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onLocationMessage };
