import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onEditedMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageText = ctx.editedMessage?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.editedMessage);
  }

  const editMessageText = ctx.i18n.t('message_edited', { newMessage: messageText });
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.editedMessage}`, {
    chatId,
    editMessageText,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendMessage(opponentChatId, editMessageText);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onEditedMessage };
