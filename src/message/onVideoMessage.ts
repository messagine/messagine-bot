import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVideoMessage = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.video}`);

  const chatId = getChatId(ctx);
  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.video);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const sendMessagePromise = ctx.tg.sendVideo(opponentChatId, messageVideo.file_id);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVideoMessage };
