import { getChatId, IMessagineContext } from '../lib/common';
import { getChatCount, getPreviousChatCount, getUserCount, getUserPreviousChatCount } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const statsCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.stats}`);

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

  const messageParts = [
    ctx.i18n.t('user_stats', { numberOfUsers: result[0] }),
    ctx.i18n.t('all_chat_stats', { numberOfChats: result[1] }),
    ctx.i18n.t('previous_chat_stats', { numberOfPreviousChats: result[2] }),
    ctx.i18n.t('my_previous_chat_stats', { numberOfMyPreviousChats: result[3] }),
  ];

  const message = messageParts.join('\n');
  return await ctx.reply(message);
};

export { statsCommand };
