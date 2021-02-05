import { extractOpponentChatId, getChatId, getExistingChat, IMessagineContext } from '../lib/common';
import { createPreviousChat, deleteChat } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const exitChatCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.exitChat}`);

  const chatId = getChatId(ctx);
  const existingChat = await getExistingChat(ctx, chatId);
  const opponentChatId = extractOpponentChatId(ctx, existingChat, chatId);
  const sendMessagePromise = ctx.reply(ctx.i18n.t('exit_chat', { findChatCommand: commandEnum.findChat }));

  const deleteChatPromise = deleteChat(existingChat.id);
  const previousChatCreatePromise = createPreviousChat(existingChat, chatId);
  const sendMessageToOpponentPromise = ctx.tg.sendMessage(
    opponentChatId,
    ctx.i18n.t('exit_chat_opponent', { findChatCommand: commandEnum.findChat }),
  );

  const promises: Promise<any>[] = [
    sendMessagePromise,
    deleteChatPromise,
    previousChatCreatePromise,
    sendMessageToOpponentPromise,
  ];

  return await Promise.all(promises);
};

export { exitChatCommand };
