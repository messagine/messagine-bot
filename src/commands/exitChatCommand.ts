import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import { getOpponentChatIds } from '../lib/common';
import { createPreviousChat, deleteChat, findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug(`command:${commandEnum.exitChat}`);

const exitChatCommand = () => async (ctx: TelegrafContext) => {
  debug(`Triggered "${commandEnum.exitChat}" command.`);

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const sendMessagePromise = ctx.reply(
    `You have closed the conversation. To find new chat, type /${commandEnum.findChat} command.`,
  );
  const deleteChatPromise = deleteChat(existingChat.id);
  const previousChatCreatePromise = createPreviousChat(existingChat, chatId);

  const promises: Array<Promise<any>> = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
  opponentChatIds.forEach(opponentChatId => {
    promises.push(
      ctx.tg.sendMessage(
        opponentChatId,
        `Conversation closed by opponent. To find new chat, type /${commandEnum.findChat} command.`,
      ),
    );
  });

  return await Promise.all(promises);
};

export { exitChatCommand };
