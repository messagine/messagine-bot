import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onAnimationMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.animation}`);

  const chatId = getChatId(ctx);
  const messageAnimation = ctx.message?.animation;
  if (!messageAnimation) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.animation);
  }

  const opponentChatId = await getOpponentChatId(ctx, chatId);
  return await ctx.tg.sendAnimation(opponentChatId, messageAnimation.file_id);
};

export { onAnimationMessage };
