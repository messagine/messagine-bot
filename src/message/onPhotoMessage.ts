import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onPhotoMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messagePhoto = ctx.message?.photo;
  if (!messagePhoto) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.photo);
  }

  const photoSize = messagePhoto.length;
  const biggestPhoto = messagePhoto[photoSize - 1];
  const fileId = biggestPhoto.file_id;

  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.photo}`, {chatId, opponentChatId, fileId});
  const sendMessagePromise = ctx.tg.sendPhoto(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onPhotoMessage };
