import {
  extractOpponentChatId,
  getChatId,
  getExistingChat,
  IMessagineContext,
  moveChatToPreviousChats,
} from '../lib/common';
import { actionEnum, commandEnum, eventTypeEnum } from '../lib/enums';
import { exitChatAreYouSureReply, exitChatReply, exitChatToOpponent } from '../reply';

const exitChatCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.exitChat}`);
  return Promise.all([mixPanelPromise, onExitChat(ctx)]);
};

const exitChatAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.exitChat}`);
  return Promise.all([mixPanelPromise, onExitChat(ctx), ctx.answerCbQuery()]);
};

function onExitChat(ctx: IMessagineContext) {
  getExistingChat(ctx);
  return exitChatAreYouSureReply(ctx);
}

const exitChatSureAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.exitChatSure}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onExitChatSure(ctx), ctx.answerCbQuery()]);
};

function onExitChatSure(ctx: IMessagineContext) {
  const chatId = getChatId(ctx);
  const existingChat = getExistingChat(ctx);
  const opponentChatId = extractOpponentChatId(ctx, existingChat);
  const sendMessagePromise = exitChatReply(ctx);

  const moveChatToPreviousChatsPromise = moveChatToPreviousChats(existingChat, chatId);
  const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);

  const promises: Promise<any>[] = [sendMessagePromise, moveChatToPreviousChatsPromise, sendMessageToOpponentPromise];

  return Promise.all(promises);
}

export { exitChatAction, exitChatCommand, exitChatSureAction };
