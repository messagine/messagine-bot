import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import { getChatId } from '../lib/common';
import { leaveLobby } from '../lib/dataHandler';

const cancelFindCommand = () => async (ctx: TelegrafContext) => {
  const chatId = getChatId(ctx);
  const leaveLobbyPromise = leaveLobby(chatId);
  const leftMessagePromise = ctx.reply(`Find chat cancelled. To find new chat, type /${commandEnum.findChat} command.`);

  return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancelFindCommand };
