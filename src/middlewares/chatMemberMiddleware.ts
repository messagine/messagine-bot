import { extractOpponentForChatId, getUserInfoSafe, moveChatToPreviousChats } from '../lib/common';
import { actionEnum, eventTypeEnum } from '../lib/enums';
import { exitChatToOpponent } from '../reply';

const chatMemberMiddleware = async (ctx: any, next: any): Promise<void> => {
  if (ctx?.update?.my_chat_member) {
    const chatId = ctx.update.my_chat_member.chat.id;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;
    if (newStatus === 'kicked') {
      await onUserLeft(ctx, chatId);
    } else if (newStatus === 'member') {
      await onUserReturned(ctx, chatId);
    } else {
      throw new Error(`Unexpected new chat member status: ${newStatus}`);
    }
    return;
  }
  await next();
};

async function onUserLeft(ctx: any, chatId: number) {
  const userInfo = await getUserInfoSafe(ctx, chatId);
  const promises: Promise<any>[] = [];
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.userLeft}`, { distinct_id: chatId });
  promises.push(mixPanelPromise);

  ctx.i18n.locale(userInfo.user.languageCode);
  const userBlockPromise = ctx.db.userBlockedChange(chatId, true);
  promises.push(userBlockPromise);

  if (userInfo.lobby) {
    const leaveLobbyPromise = ctx.db.leaveLobby(chatId);
    promises.push(leaveLobbyPromise);
  }
  if (userInfo.chat) {
    const opponentChatId = extractOpponentForChatId(ctx, chatId, userInfo.chat);
    const moveChatToPreviousChatsPromise = moveChatToPreviousChats(ctx, userInfo.chat, chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(moveChatToPreviousChatsPromise);
    promises.push(sendMessageToOpponentPromise);
  }
  return Promise.all(promises);
}

function onUserReturned(ctx: any, chatId: number) {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.userReturned}`, {
    distinct_id: chatId,
  });
  const userBlockPromise = ctx.db.userBlockedChange(chatId, false);
  return Promise.all([mixPanelPromise, userBlockPromise]);
}

export { chatMemberMiddleware };
