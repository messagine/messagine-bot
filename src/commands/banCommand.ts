import {
  checkAdmin,
  extractOpponentForChatId,
  getInputUserInfoSafe,
  IMessagineContext,
  moveChatToPreviousChats,
} from '../lib/common';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatToOpponent } from '../reply';

const banCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.ban}`);
  return Promise.all([mixPanelPromise, onBan(ctx)]);
};

async function onBan(ctx: IMessagineContext) {
  checkAdmin(ctx);
  const inputUserInfo = await getInputUserInfoSafe(ctx);

  const promises: Promise<any>[] = [];
  const replyPromise = ctx.reply(ctx.i18n.t('ban_reply'));
  promises.push(replyPromise);

  ctx.i18n.locale(inputUserInfo.user.languageCode);
  const userBanPromise = ctx.db.userBannedChange(inputUserInfo.chatId, true);
  promises.push(userBanPromise);

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

  return Promise.all(promises);
}

export { banCommand };
