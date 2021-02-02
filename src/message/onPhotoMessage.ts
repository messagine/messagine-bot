import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_photo');

const onPhotoMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_photo" message.');

  const chatId = getChatId(ctx);
  const messagePhoto = ctx.message?.photo;
  if (!messagePhoto) {
    throw new MessageTypeNotFoundError(chatId, 'photo');
  }

  const photoSize = messagePhoto.length;
  const biggestPhoto = messagePhoto[photoSize - 1];

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendPhoto(opponentChatId, biggestPhoto.file_id);
};

export { onPhotoMessage };
