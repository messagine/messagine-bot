import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_document');

const onDocumentMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_document" message.');

  const chatId = getChatId(ctx);
  const messageDocument = ctx.message?.document;
  if (!messageDocument) {
    throw new MessageTypeNotFoundError(chatId, 'document');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendDocument(opponentChatId, messageDocument.file_id);
};

export { onDocumentMessage };
