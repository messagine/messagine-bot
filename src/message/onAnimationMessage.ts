import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onAnimationMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageAnimation = ctx.message?.animation;
  if (!messageAnimation) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.animation);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const fileId = messageAnimation.file_id;
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.animation}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendAnimation(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onAnimationMessage };
