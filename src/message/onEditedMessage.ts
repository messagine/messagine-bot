import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onEditedMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.editedMessage}`);

  const chatId = getChatId(ctx);
  const messageText = ctx.editedMessage?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(chatId, messageTypeEnum.editedMessage);
  }

  const editMessageText = `Edited to: ${messageText}`;
  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendMessage(opponentChatId, editMessageText);
};

export { onEditedMessage };
