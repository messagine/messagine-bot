import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_animation');

const onAnimationMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_animation" message.');

  const chatId = getChatId(ctx);
  const messageAnimation = ctx.message?.animation;
  if (!messageAnimation) {
    throw new MessageTypeNotFoundError(chatId, 'animation');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendAnimation(opponentChatId, messageAnimation.file_id);
};

export { onAnimationMessage };
