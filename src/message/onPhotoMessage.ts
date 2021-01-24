import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('message:on_photo');

const onPhotoMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_photo" message');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messagePhoto = ctx.message?.photo;
  if (!messagePhoto) {
    debug('Message photo not found.');
    return await ctx.reply('Message photo not found.');
  }

  const photoSize = messagePhoto.length;
  const biggestPhoto = messagePhoto[photoSize - 1];

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Array<Promise<any>> = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendPhoto(opponentChatId, biggestPhoto.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onPhotoMessage };
