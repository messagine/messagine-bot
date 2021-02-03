import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onPhotoMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.photo}`);

  const chatId = getChatId(ctx);
  const messagePhoto = ctx.message?.photo;
  if (!messagePhoto) {
    throw new MessageTypeNotFoundError(chatId, messageTypeEnum.photo);
  }

  const photoSize = messagePhoto.length;
  const biggestPhoto = messagePhoto[photoSize - 1];

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendPhoto(opponentChatId, biggestPhoto.file_id);
};

export { onPhotoMessage };
