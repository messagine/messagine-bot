import { getChatId, IMessagineContext } from '../lib/common';
import {
  getChatCount,
  getLobbyCount,
  getPreviousChatCount,
  getUserCount,
  getUserPreviousChatCount,
} from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { aboutReply } from '../reply';

const aboutCommand = () => (ctx: IMessagineContext) => {
  return onAbout(ctx);
};

const aboutAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onAbout(ctx), ctx.answerCbQuery()]);
};

async function onAbout(ctx: IMessagineContext) {
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

  return aboutReply(
    ctx,
    numberOfActiveChats,
    numberOfLobbyUsers,
    numberOfMyPreviousChats,
    numberOfPreviousChats,
    numberOfUsers,
  );
}

export { aboutAction, aboutCommand };
