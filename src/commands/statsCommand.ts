import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import { getChatCount, getPreviousChatCount, getUserCount, getUserPreviousChatCount } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug(`command:${commandEnum.stats}`);

const statsCommand = () => async (ctx: TelegrafContext) => {
  debug(`Triggered "${commandEnum.stats}" command.`);

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const userCountPromise = getUserCount();
  const chatCountPromise = getChatCount();
  const previousChatCountPromise = getPreviousChatCount();
  const userPreviousChatCountPromise = getUserPreviousChatCount(chatId);

  const result = await Promise.all([
    userCountPromise,
    chatCountPromise,
    previousChatCountPromise,
    userPreviousChatCountPromise,
  ]);

  const messageParts = [
    `Users: ${result[0]}`,
    `Chats: ${result[1]}`,
    `Previous Chats: ${result[2]}`,
    `Your Previous Chats: ${result[3]}`,
  ];

  const message = messageParts.join('\n');
  return await ctx.reply(message);
};

export { statsCommand };
