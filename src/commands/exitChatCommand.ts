import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
import { createPreviousChat, deleteChat } from '../lib/dataHandler';
const debug = Debug(`command:${commandEnum.exitChat}`);

const exitChatCommand = () => async (ctx: TelegrafContext) => {
  debug(`Triggered "${commandEnum.exitChat}" command.`);

  const chatId = getChatId(ctx);
  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const sendMessagePromise = ctx.reply(
    `You have closed the conversation. To find new chat, type /${commandEnum.findChat} command.`,
  );
  const deleteChatPromise = deleteChat(existingChat.id);
  const previousChatCreatePromise = createPreviousChat(existingChat, chatId);

  const promises: Promise<any>[] = [sendMessagePromise, deleteChatPromise, previousChatCreatePromise];
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
