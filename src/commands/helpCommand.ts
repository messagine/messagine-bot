import { getChatId, IMessagineContext } from '../lib/common';
import { findExistingChat, findLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { helpReply } from '../reply';

const helpCommand = () => (ctx: IMessagineContext) => {
  return onHelp(ctx);
};

const helpAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onHelp(ctx), ctx.answerCbQuery()]);
};

async function onHelp(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  const state = await getUserState(ctx);
  return helpReply(ctx, state);
}

// TODO: Move to Context
async function getUserState(ctx: IMessagineContext): Promise<string> {
  const chatId = getChatId(ctx);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);
  const checkResults = await Promise.all([lobbyPromise, existingChatPromise]);

  const lobby = checkResults[0];
  if (lobby) {
    return userStateEnum.lobby;
  }

  const existingChat = checkResults[1];
  if (existingChat) {
    return userStateEnum.chat;
  }

  return userStateEnum.idle;
}

export { helpAction, helpCommand };
