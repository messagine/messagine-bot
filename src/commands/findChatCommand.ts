import _ from 'lodash';
import { getChatId, IMessagineContext } from '../lib/common';
import { addToLobby, createChat, findOpponentsInLobby, getUserPreviousChats, leaveLobby } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { IPreviousChat } from '../lib/models/PreviousChat';
import { activeChatReply, chatStartReply, lobbyWaitReply, userNotFoundReply } from '../reply';

const findChatCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, onFindChat(ctx)]);
};

const findChatAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.findChat}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onFindChat(ctx), ctx.answerCbQuery()]);
};

async function onFindChat(ctx: IMessagineContext) {
  if (ctx.userState === userStateEnum.lobby) {
    return lobbyWaitReply(ctx);
  }

  if (ctx.userState === userStateEnum.chat) {
    return activeChatReply(ctx);
  }

  const user = ctx.user;
  if (!user) {
    return userNotFoundReply(ctx);
  }

  const chatId = getChatId(ctx);

  const myPreviousChatsPromise = getUserPreviousChats(chatId);
  const possibleOpponetsPromise = findOpponentsInLobby(chatId, user.languageCode);
  const chatFindPromiseResults = await Promise.all([myPreviousChatsPromise, possibleOpponetsPromise]);
  const myPreviousChats = chatFindPromiseResults[0];
  const possibleOpponents = chatFindPromiseResults[1];
  const possibleOpponentChatIds: number[] = [];
  if (possibleOpponents) {
    possibleOpponents.forEach(o => {
      possibleOpponentChatIds.push(o.chatId);
    });
  }

  const myPreviousChatOpponentIds = getMyPreviousChatOpponentIds(chatId, myPreviousChats);
  const opponentChatId = getOpponentChatId(chatId, possibleOpponentChatIds, myPreviousChatOpponentIds);

  if (opponentChatId) {
    const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = leaveLobby(opponentChatId);
    const createChatPromise = createChat(chatId, opponentChatId, user.languageCode);
    const chatStartToCurrentUserPromise = chatStartReply(ctx, chatId);
    const chatStartToOpponentUserPromise = chatStartReply(ctx, opponentChatId);

    return Promise.all([
      leaveCurrentUserLobbyPromise,
      leaveOpponentUserLobbyPromise,
      createChatPromise,
      chatStartToCurrentUserPromise,
      chatStartToOpponentUserPromise,
    ]);
  } else {
    const addToLobbyPromise = addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = lobbyWaitReply(ctx);

    return Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
}

function getMyPreviousChatOpponentIds(chatId: number, myPreviousChats: IPreviousChat[] | null): number[] {
  const myPreviousChatOpponentIds: number[] = [];
  if (myPreviousChats) {
    myPreviousChats.forEach(c => {
      const opponentChatIds = c.chatIds.filter(id => chatId !== id);
      if (opponentChatIds.length === 1) {
        myPreviousChatOpponentIds.push(opponentChatIds[0]);
      }
    });
  }
  return myPreviousChatOpponentIds;
}

function getOpponentChatId(
  chatId: number,
  possibleOpponentChatIds: number[],
  myPreviousChatOpponentIds: number[],
): number | null {
  for (const possibleOpponentChatId of possibleOpponentChatIds) {
    if (possibleOpponentChatId === chatId) {
      continue;
    }
    if (_.includes(myPreviousChatOpponentIds, possibleOpponentChatId)) {
      continue;
    }
    return possibleOpponentChatId;
  }
  return null;
}

export { findChatAction, findChatCommand };
