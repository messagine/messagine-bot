import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onDocumentMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageDocument = ctx.message?.document;
  if (!messageDocument) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.document);
  }

  const fileId = messageDocument.file_id;
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.document}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendDocument(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onDocumentMessage };
