import {
  checkAdmin,
  extractOpponentForChatId,
  getChatId,
  getInputUserInfoSafe,
  IMessagineContext,
  moveChatToPreviousChats,
} from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatToOpponent } from '../reply';

const adminChatCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.adminChat}`);
  return Promise.all([mixPanelPromise, onAdminChat(ctx)]);
};

async function onAdminChat(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const chatId = getChatId(ctx);
  const inputUserInfo = await getInputUserInfoSafe(ctx);
  if (inputUserInfo.user.blocked) {
    return ctx.reply(ctx.i18n.t('user_status_blocked'));
  }
  if (inputUserInfo.user.banned) {
    return ctx.reply(ctx.i18n.t('user_status_banned'));
  }

  const promises: Promise<any>[] = [];
  const replyPromise = ctx.reply(ctx.i18n.t('admin_chat_started'));
  promises.push(replyPromise);

  if (inputUserInfo.lobby) {
    const leaveLobbyPromise = ctx.db.leaveLobby(inputUserInfo.chatId);
    promises.push(leaveLobbyPromise);
  }

  if (inputUserInfo.chat) {
    const opponentChatId = extractOpponentForChatId(ctx, inputUserInfo.chatId, inputUserInfo.chat);
    const moveChatToPreviousChatsPromise = moveChatToPreviousChats(ctx, inputUserInfo.chat, inputUserInfo.chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(moveChatToPreviousChatsPromise);
    promises.push(sendMessageToOpponentPromise);
  }

  const chatIds = [chatId, inputUserInfo.chatId];
  const createChatPromise = ctx.db.createAdminChat(chatIds, inputUserInfo.user.languageCode);
  promises.push(createChatPromise);

  return Promise.all(promises);
}

export { adminChatCommand };
