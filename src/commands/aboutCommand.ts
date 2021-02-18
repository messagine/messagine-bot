import { getChatId, IMessagineContext } from '../lib/common';
import {
  getChatCount,
  getLobbyCount,
  getPreviousChatCount,
  getUserCount,
  getUserPreviousChatCount,
} from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const aboutCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.about}`);

  const chatId = getChatId(ctx);
  const userCountPromise = getUserCount();
  const chatCountPromise = getChatCount();
  const previousChatCountPromise = getPreviousChatCount();
  const userPreviousChatCountPromise = getUserPreviousChatCount(chatId);
  const lobbyCountPromise = getLobbyCount();

  const result = await Promise.all([
    userCountPromise,
    chatCountPromise,
    previousChatCountPromise,
    userPreviousChatCountPromise,
    lobbyCountPromise,
  ]);
  const numberOfUsers = result[0];
  const numberOfActiveChats = result[1];
  const numberOfPreviousChats = result[2];
  const numberOfMyPreviousChats = result[3];
  const numberOfLobbyUsers = result[4];

  return ctx.replyWithHTML(
    ctx.i18n.t('about_reply', {
      numberOfActiveChats,
      numberOfLobbyUsers,
      numberOfMyPreviousChats,
      numberOfPreviousChats,
      numberOfUsers,
    }),
  );
};

export { aboutCommand };
