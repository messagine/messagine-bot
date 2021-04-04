import Debug from 'debug';
import _ from 'lodash';
import { Message } from 'telegram-typings';
import { IMessagineContext } from '../lib/common';
import { userStateEnum } from '../lib/enums';
import { IChat } from '../lib/models/Chat';
import { ILobby } from '../lib/models/Lobby';
import { IUser } from '../lib/models/User';
import { chatReminderReply, idleReminderReply, lobbyReminderReply } from '../reply';
const debug = Debug('job:chatReminder');

const chatReminderMiddleware = async (ctx: IMessagineContext): Promise<void> => {
  debug(`Chat reminder started.`);
  const activeUsersPromise = ctx.db.getActiveUsers();
  const lobbyUsersPromise = ctx.db.getAllLobbyUsers();
  const chatsPromise = ctx.db.getAllChatUsers();
  const result = await Promise.all([activeUsersPromise, lobbyUsersPromise, chatsPromise]);
  const activeUsers = result[0];
  const lobbyUsers = result[1];
  const chats = result[2];
  if (!activeUsers || activeUsers.length === 0) {
    debug('Active users not found.');
    return;
  }

  const lobbyChatIds = getLobbyChatIds(lobbyUsers);
  const chatChatIds = getChatChatIds(chats);

  const promises: Promise<any>[] = [];
  for (const activeUser of activeUsers) {
    const timeToSend = timeToSendReminder(activeUser);
    if (!timeToSend) {
      continue;
    }
    const userState = getUserState(activeUser.chatId, lobbyChatIds, chatChatIds);
    const sendReminderPromise = sendReminder(ctx, activeUser, userState);
    promises.push(sendReminderPromise);
  }

  await Promise.all(promises);
};

function timeToSendReminder(user: IUser): boolean {
  const nextReminder = user.nextReminder;
  if (!nextReminder) {
    return false;
  }
  return nextReminder < new Date();
}

async function sendReminder(ctx: IMessagineContext, user: IUser, state: string): Promise<any[]> {
  ctx.i18n.locale(user.languageCode);
  const clearReminderPromise = ctx.db.clearReminder(user.chatId);
  const addReminderPromise = ctx.db.addReminder(user.chatId, state);
  let replyPromise: Promise<Message>;
  switch (state) {
    case userStateEnum.idle:
      replyPromise = idleReminderReply(ctx, user.chatId);
      break;
    case userStateEnum.lobby:
      replyPromise = lobbyReminderReply(ctx, user.chatId);
      break;
    case userStateEnum.chat:
      replyPromise = chatReminderReply(ctx, user.chatId);
      break;
    default:
      throw new Error('Invalid state error.');
  }
  const promises: Promise<any>[] = [clearReminderPromise, addReminderPromise, replyPromise];

  debug(`Reminder sent.`);
  return Promise.all(promises);
}

function getLobbyChatIds(lobbyUsers: ILobby[] | null): number[] {
  if (!lobbyUsers || lobbyUsers.length === 0) {
    return [];
  }
  return _.map(lobbyUsers, l => l.chatId);
}

function getChatChatIds(chats: IChat[] | null): number[] {
  if (!chats || chats.length === 0) {
    return [];
  }
  const chatIds: number[] = [];
  for (const chat of chats) {
    chatIds.push(...chat.chatIds);
  }
  return chatIds;
}

function getUserState(chatId: number, lobbyChatIds: number[], chatChatIds: number[]) {
  if (_.includes(lobbyChatIds, chatId)) {
    return userStateEnum.lobby;
  } else if (_.includes(chatChatIds, chatId)) {
    return userStateEnum.chat;
  } else {
    return userStateEnum.idle;
  }
}

export { chatReminderMiddleware };
