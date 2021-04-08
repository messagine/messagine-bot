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
  const remindableUsersPromise = ctx.db.getRemindableUsers();
  const lobbyUsersPromise = ctx.db.getAllLobbyUsers();
  const chatsPromise = ctx.db.getAllChatUsers();
  const result = await Promise.all([remindableUsersPromise, lobbyUsersPromise, chatsPromise]);
  const remindableUsers = result[0];
  const lobbyUsers = result[1];
  const chats = result[2];
  if (!remindableUsers || remindableUsers.length === 0) {
    debug('Remindable users not found.');
    return;
  }

  debug(`${remindableUsers.length} remindable users found.`);
  const lobbyChatIds = getLobbyChatIds(lobbyUsers);
  const chatChatIds = getChatChatIds(chats);

  const promises: Promise<any>[] = [];
  for (const remindableUser of remindableUsers) {
    const userState = getUserState(remindableUser.chatId, lobbyChatIds, chatChatIds);
    const sendReminderPromise = sendReminder(ctx, remindableUser, userState);
    promises.push(sendReminderPromise);
  }

  await Promise.all(promises);
};

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
