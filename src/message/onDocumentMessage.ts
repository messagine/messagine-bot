import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_document');

const onDocumentMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_document" message.');

  const chatId = getChatId(ctx);
  const messageDocument = ctx.message?.document;
  if (!messageDocument) {
    throw new MessageTypeNotFoundError(chatId, 'document');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendDocument(opponentChatId, messageDocument.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onDocumentMessage };
