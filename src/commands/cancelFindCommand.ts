import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { leaveLobby } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('command:cancel_find');

const cancelFindCommand = () => async (ctx: TelegrafContext) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const leaveLobbyPromise = leaveLobby(chatId);
  const leftMessagePromise = ctx.reply('Find chat cancelled. To find new chat, type /find_chat command.');

  return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancelFindCommand };
