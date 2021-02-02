import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_video');

const onVideoMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_video" message.');

  const chatId = getChatId(ctx);
  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    throw new MessageTypeNotFoundError(chatId, 'video');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendVideo(opponentChatId, messageVideo.file_id);
};

export { onVideoMessage };
