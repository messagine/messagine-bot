import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onTextMessage = () => async (ctx: IMessagineContext) => {
  await ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.text}`);

  const chatId = getChatId(ctx);
  const messageText = ctx.message?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.text);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return ctx.tg.sendMessage(opponentChatId, messageText);
};

export { onTextMessage };
