import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_text');

const onTextMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_text" message.');

  const chatId = getChatId(ctx);
  const messageText = ctx.message?.text;
  if (!messageText) {
    throw new MessageTypeNotFoundError(chatId, 'text');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendMessage(opponentChatId, messageText);
};

export { onTextMessage };
