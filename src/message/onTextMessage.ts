import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_text');

const onTextMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_text" message.');

  const chatId = getChatId(ctx);
  const messageText = ctx.message?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(chatId, 'text');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendMessage(opponentChatId, messageText);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onTextMessage };
