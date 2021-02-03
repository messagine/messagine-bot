import { getChatId, IMessagineContext } from '../lib/common';
import { leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const cancelFindCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.cancelFind}`);
  const chatId = getChatId(ctx);
  const leaveLobbyPromise = leaveLobby(chatId);
  const leftMessagePromise = ctx.reply(`Find chat cancelled. To find new chat, type /${commandEnum.findChat} command.`);

  return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancelFindCommand };
