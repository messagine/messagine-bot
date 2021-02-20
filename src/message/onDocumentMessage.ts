import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onDocumentMessage = () => async (ctx: IMessagineContext) => {
  await ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.document}`);

  const chatId = getChatId(ctx);
  const messageDocument = ctx.message?.document;
  if (!messageDocument) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.document);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return ctx.tg.sendDocument(opponentChatId, messageDocument.file_id);
};

export { onDocumentMessage };
