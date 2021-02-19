import { getChatId, IMessagineContext } from '../lib/common';
import { leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const cancelFindCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.cancelFind}`);
  const chatId = getChatId(ctx);
  const leaveLobbyPromise = leaveLobby(chatId);
  const leftMessagePromise = ctx.reply(ctx.i18n.t('cancel_find', { findChatCommand: commandEnum.findChat }));

  return await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancelFindCommand };
