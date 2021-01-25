import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('message:on_video');

const onVideoMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_video" message.');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    debug('Message video not found.');
    return await ctx.reply('Message video not found.');
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendPhoto(opponentChatId, messageVideo.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onVideoMessage };
