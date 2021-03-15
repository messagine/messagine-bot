import {
  checkAdmin,
  extractOpponentForChatId,
  getInputUserInfo,
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
  const inputUserInfo = await getInputUserInfo(ctx);

  const promises: Promise<any>[] = [];
  const replyPromise = ctx.reply(ctx.i18n.t('ban_reply'));
  promises.push(replyPromise);

  ctx.i18n.locale(inputUserInfo.user.languageCode);
  const userBanPromise = userBannedChange(inputUserInfo.chatId, true);
  promises.push(userBanPromise);

  if (inputUserInfo.lobby) {
    const leaveLobbyPromise = leaveLobby(inputUserInfo.chatId);
    promises.push(leaveLobbyPromise);
  }
  if (inputUserInfo.chat) {
    const opponentChatId = extractOpponentForChatId(ctx, inputUserInfo.chatId, inputUserInfo.chat);
    const moveChatToPreviousChatsPromise = moveChatToPreviousChats(inputUserInfo.chat, inputUserInfo.chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(moveChatToPreviousChatsPromise);
    promises.push(sendMessageToOpponentPromise);
  }

  return Promise.all(promises);
}

export { banCommand };
