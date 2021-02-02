import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_edited');

const onEditedMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_edited" message.');

  const chatId = getChatId(ctx);
  const messageText = ctx.editedMessage?.text;
  if (!messageText) {
    debug('Edited message text not found.');
    return await ctx.reply('Edited message text not found.');
  }

  const existingChat = await getExistingChat(chatId);
  const editMessageText = `Edited to: ${messageText}`;
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendMessage(opponentChatId, editMessageText);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onEditedMessage };
