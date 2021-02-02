import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
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

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendPhoto(opponentChatId, biggestPhoto.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onPhotoMessage };
