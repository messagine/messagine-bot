import { extractOpponentForChatId, getChatIdInfo, IMessagineContext } from '../lib/common';
import { createPreviousChat, deleteChat, leaveLobby, userBannedChange } from '../lib/dataHandler';
import { adminCommandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatToOpponent, invalidInputReply, userNotFoundReply } from '../reply';

const banCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.admin}.${adminCommandEnum.ban}`);
  return Promise.all([mixPanelPromise, onBan(ctx)]);
};

async function onBan(ctx: IMessagineContext) {
  if (!ctx.user?.admin) {
    return;
  }
  if (ctx?.match === undefined || ctx?.match?.length !== 2) {
    return invalidInputReply(ctx);
  }

  const chatId = parseFloat(ctx.match[1]);
  const chatIdInfo = await getChatIdInfo(chatId);
  if (!chatIdInfo.user) {
    return userNotFoundReply(ctx);
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
    const deleteChatPromise = deleteChat(chatIdInfo.chat.id);
    const previousChatCreatePromise = createPreviousChat(chatIdInfo.chat, chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(deleteChatPromise);
    promises.push(previousChatCreatePromise);
    promises.push(sendMessageToOpponentPromise);
  }

  return Promise.all(promises);
}

export { banCommand };
