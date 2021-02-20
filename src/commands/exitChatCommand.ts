import { extractOpponentChatId, getChatId, getExistingChat, IMessagineContext } from '../lib/common';
import { createPreviousChat, deleteChat } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatReply, exitChatToOpponent } from '../reply';

const exitChatCommand = () => async (ctx: IMessagineContext) => {
  return await onExitChat(ctx);
};

const exitChatAction = () => (ctx: IMessagineContext) => {
  return Promise.all([
    ctx.deleteMessage(),
    onExitChat(ctx),
    ctx.answerCbQuery(),
  ]);
};

async function onExitChat(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.exitChat}`);

  const chatId = getChatId(ctx);
  const existingChat = await getExistingChat(ctx);
  const opponentChatId = extractOpponentChatId(ctx, existingChat);
  const sendMessagePromise = exitChatReply(ctx);

  const deleteChatPromise = deleteChat(existingChat.id);
  const previousChatCreatePromise = createPreviousChat(existingChat, chatId);
  const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);

  const promises: Promise<any>[] = [
    sendMessagePromise,
    deleteChatPromise,
    previousChatCreatePromise,
    sendMessageToOpponentPromise,
  ];

  return await Promise.all(promises);
}

export { exitChatAction, exitChatCommand };
