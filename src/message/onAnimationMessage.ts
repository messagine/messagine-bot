import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onAnimationMessage = () => async (ctx: IMessagineContext) => {
  await ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.animation}`);

  const chatId = getChatId(ctx);
  const messageAnimation = ctx.message?.animation;
  if (!messageAnimation) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.animation);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return ctx.tg.sendAnimation(opponentChatId, messageAnimation.file_id);
};

export { onAnimationMessage };
