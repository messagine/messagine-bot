import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onTextMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageText = ctx.message?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.text);
  }

  const opponentChatId = getOpponentChatId(ctx);

  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.text}`, {
    chatId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendMessage(opponentChatId, messageText);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onTextMessage };
