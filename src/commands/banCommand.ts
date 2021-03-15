import {
  checkAdmin,
  extractOpponentForChatId,
  getChatIdInfo,
  getFloatFromInput,
  IMessagineContext,
  moveChatToPreviousChats,
} from '../lib/common';
import { leaveLobby, userBannedChange } from '../lib/dataHandler';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatToOpponent } from '../reply';

const banCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.ban}`);
  return Promise.all([mixPanelPromise, onBan(ctx)]);
};

async function onBan(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const chatId = getFloatFromInput(ctx);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return ctx.reply(ctx.i18n.t('user_not_found'));
  }

  const promises: Promise<any>[] = [];
  const replyPromise = ctx.reply(ctx.i18n.t('ban_reply'));
  promises.push(replyPromise);

  ctx.i18n.locale(chatIdInfo.user.languageCode);
  const userBanPromise = userBannedChange(chatId, true);
  promises.push(userBanPromise);

  if (chatIdInfo.lobby) {
    const leaveLobbyPromise = leaveLobby(chatId);
    promises.push(leaveLobbyPromise);
  }
  if (chatIdInfo.chat) {
    const opponentChatId = extractOpponentForChatId(ctx, chatId, chatIdInfo.chat);
    const moveChatToPreviousChatsPromise = moveChatToPreviousChats(chatIdInfo.chat, chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(moveChatToPreviousChatsPromise);
    promises.push(sendMessageToOpponentPromise);
  }

  return Promise.all(promises);
}

export { banCommand };
