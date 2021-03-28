import Debug from 'debug';
import _ from 'lodash';
import { InvalidPeopleInChatError } from '../error';
import { IMessagineContext } from '../lib/common';
import { ILobby } from '../lib/models/Lobby';
import { IPreviousChat } from '../lib/models/PreviousChat';
import { chatStartReply } from '../reply';
const debug = Debug('job:createChat');

const createChatMiddleware = async (ctx: IMessagineContext): Promise<void> => {
  debug(`Create chat job started.`);
  const lobbyUsers = await ctx.db.getAllLobbyUsers();
  if (!lobbyUsers || lobbyUsers.length === 0) {
    debug('Lobby users not found.');
    return;
  }

  const allChatIds = _.map(lobbyUsers, u => u.chatId);
  const allPreviousChats = await ctx.db.getUsersPreviousChats(allChatIds);
  const languageGroups = groupLobbyByLanguage(lobbyUsers);
  debug(`${lobbyUsers.length} lobby users found with ${languageGroups.length} language group.`);

  const processedChatIds: number[] = [];
  const promises: Promise<any>[] = [];
  for (const languageGroup of languageGroups) {
    if (languageGroup.lobbyUsers.length <= 1) {
      debug(`${languageGroup.languageCode} lobby doesn't have enough lobby user.`);
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
        debug(`Opponent not found for ${languageGroup.languageCode} lobby user.`);
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
  return _(chatIds).without(chatId).difference(processedChatIds).difference(previousOpponents).head();
}

function createSingleChat(ctx: IMessagineContext, chatIds: number[], languageCode: string): Promise<any[]> {
  if (chatIds.length !== 2) {
    throw new InvalidPeopleInChatError(ctx, chatIds);
  }
  ctx.i18n.locale(languageCode);
  const createChatPromise = ctx.db.createChat(chatIds, languageCode);
  const promises: Promise<any>[] = [createChatPromise];
  for (const chatId of chatIds) {
    const leaveLobbyPromise = ctx.db.leaveLobby(chatId);
    const chatStartReplyPromise = chatStartReply(ctx, chatId);
    promises.push(leaveLobbyPromise);
    promises.push(chatStartReplyPromise);
  }
  debug(`Chat created for ${languageCode}.`);
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
