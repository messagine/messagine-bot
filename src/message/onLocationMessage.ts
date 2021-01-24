import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('message:on_location');

const onLocationMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_location" message.');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messageLocation = ctx.message?.location;
  if (!messageLocation) {
    debug('Message location not found.');
    return await ctx.reply('Message location not found.');
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Array<Promise<any>> = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendLocation(opponentChatId, messageLocation.latitude, messageLocation.longitude);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onLocationMessage };
