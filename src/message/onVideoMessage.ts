import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVideoMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.video);
  }

  const fileId = messageVideo.file_id;
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.video}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendVideo(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVideoMessage };
