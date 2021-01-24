import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import { leaveLobby } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug(`command:${commandEnum.cancelFind}`);

const cancelFindCommand = () => async (ctx: TelegrafContext) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const leaveLobbyPromise = leaveLobby(chatId);
  const leftMessagePromise = ctx.reply(`Find chat cancelled. To find new chat, type /${commandEnum.findChat} command.`);

  return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancelFindCommand };
