import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_video');

const onVideoMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_video" message.');

  const chatId = getChatId(ctx);
  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    throw new MessageTypeNotFoundError(chatId, 'video');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendVideo(opponentChatId, messageVideo.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onVideoMessage };
