import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_animation');

const onAnimationMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_animation" message.');

  const chatId = getChatId(ctx);
  const messageAnimation = ctx.message?.animation;
  if (!messageAnimation) {
    throw new MessageTypeNotFoundError(chatId, 'animation');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendAnimation(opponentChatId, messageAnimation.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onAnimationMessage };
