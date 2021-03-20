import _ from 'lodash';
import { InvalidPeopleInChatError } from '../error';
import { IMessagineContext } from '../lib/common';
import { createChat, getAllLobbyUsers, getUsersPreviousChats, leaveLobby } from '../lib/dataHandler';
import { ILobby } from '../lib/models/Lobby';
import { IPreviousChat } from '../lib/models/PreviousChat';
import { chatStartReply } from '../reply';

const createChatMiddleware = async (ctx: IMessagineContext): Promise<void> => {
  const lobbyUsers = await getAllLobbyUsers();
  if (!lobbyUsers || lobbyUsers.length === 0) {
    return;
  }

  const allChatIds = _.map(lobbyUsers, u => u.chatId);
  const allPreviousChats = await getUsersPreviousChats(allChatIds);
  const languageGroups = groupLobbyByLanguage(lobbyUsers);

  const processedChatIds: number[] = [];
  const promises: Promise<any>[] = [];
  for (const languageGroup of languageGroups) {
    if (languageGroup.lobbyUsers.length <= 1) {
      continue;
    }
    const chatIds = _.map(languageGroup.lobbyUsers, u => u.chatId);
    for (const chatId of chatIds) {
      if (_.includes(processedChatIds, chatId)) {
        continue;
      }
      processedChatIds.push(chatId);

      const opponent = findOpponent(chatId, chatIds, processedChatIds, allPreviousChats);
      if (!opponent) {
        continue;
      }

      processedChatIds.push(opponent);
      const createChatPromise = createSingleChat(ctx, [chatId, opponent], languageGroup.languageCode);
      promises.push(createChatPromise);
    }
  }

  await Promise.all(promises);
};

function findOpponent(
  chatId: number,
  chatIds: number[],
  processedChatIds: number[],
  allPreviousChats: IPreviousChat[] | null,
) {
  const previousOpponents = getPreviousOpponents(chatId, allPreviousChats);
  const opponent = _(chatIds).without(chatId).difference(processedChatIds).difference(previousOpponents).head();
  return opponent;
}

function createSingleChat(ctx: IMessagineContext, chatIds: number[], languageCode: string): Promise<any[]> {
  if (chatIds.length !== 2) {
    throw new InvalidPeopleInChatError(ctx, chatIds);
  }
  ctx.i18n.locale(languageCode);
  const createChatPromise = createChat(chatIds, languageCode);
  const promises: Promise<any>[] = [createChatPromise];
  for (const chatId of chatIds) {
    const leaveLobbyPromise = leaveLobby(chatId);
    const chatStartReplyPromise = chatStartReply(ctx, chatId);
    promises.push(leaveLobbyPromise);
    promises.push(chatStartReplyPromise);
  }
  return Promise.all(promises);
}

function groupLobbyByLanguage(lobbyUsers: ILobby[]) {
  return _(lobbyUsers)
    .groupBy(x => x.languageCode)
    .map((value, key) => ({ languageCode: key, lobbyUsers: value }))
    .value();
}

function getPreviousOpponents(chatId: number, allPreviousChats: IPreviousChat[] | null): number[] {
  const previousOpponents: number[] = [];
  if (!allPreviousChats) {
    return previousOpponents;
  }
  for (const previousChat of allPreviousChats) {
    if (!_.includes(previousChat.chatIds, chatId)) {
      continue;
    }
    const opponents = _.without(previousChat.chatIds, chatId);
    if (opponents.length === 1) {
      previousOpponents.push(opponents[0]);
    }
  }
  return previousOpponents;
}

export { createChatMiddleware };
