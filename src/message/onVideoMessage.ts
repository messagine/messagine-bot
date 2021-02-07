import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVideoMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.video}`);

  const chatId = getChatId(ctx);
  const messageVideo = ctx.message?.video;
  if (!messageVideo) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.video);
  }

  const opponentChatId = await getOpponentChatId(ctx);
  return await ctx.tg.sendVideo(opponentChatId, messageVideo.file_id);
};

export { onVideoMessage };
