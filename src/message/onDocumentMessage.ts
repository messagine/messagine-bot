import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onDocumentMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.document}`);

  const chatId = getChatId(ctx);
  const messageDocument = ctx.message?.document;
  if (!messageDocument) {
    throw new MessageTypeNotFoundError(chatId, messageTypeEnum.document);
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendDocument(opponentChatId, messageDocument.file_id);
};

export { onDocumentMessage };
