import { getChatId, IMessagineContext } from '../lib/common';
import { getChatCount, getPreviousChatCount, getUserCount, getUserPreviousChatCount } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const aboutCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.about}`);

  const chatId = getChatId(ctx);
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
  const numberOfUsers = result[0];
  const numberOfActiveChats = result[1];
  const numberOfPreviousChats = result[2];
  const numberOfMyPreviousChats = result[3];

  return await ctx.replyWithHTML(
    ctx.i18n.t('about_reply', { numberOfUsers, numberOfActiveChats, numberOfPreviousChats, numberOfMyPreviousChats }),
  );
};

export { aboutCommand };
