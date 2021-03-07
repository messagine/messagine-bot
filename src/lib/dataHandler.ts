import mongoose from 'mongoose';
import config from '../config';
import Chat, { IChat } from './models/Chat';
import Lobby, { ILobby } from './models/Lobby';
import PreviousChat, { IPreviousChat } from './models/PreviousChat';
import User, { IUser } from './models/User';

export function connect() {
  if (connected()) {
    return;
  }
  return mongoose.connect(config.DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

function connected() {
  return mongoose.connection.readyState === 1;
}

export function getUser(chatId: number): Promise<IUser | null> {
  return User.findOne({ chatId }).exec();
}

export function addUser(chatId: number, languageCode: string): Promise<IUser> {
  return User.create({ chatId, languageCode });
}

export function setLanguage(chatId: number, languageCode: string) {
  return User.updateOne({ chatId }, { $set: { languageCode } }, { upsert: true }).exec();
}

export function addToLobby(chatId: number, languageCode: string): Promise<ILobby> {
  return Lobby.create({ chatId, languageCode });
}

export function findLobby(chatId: number): Promise<ILobby | null> {
  return Lobby.findOne({ chatId }).exec();
}

export function findOpponentsInLobby(chatId: number, languageCode: string): Promise<ILobby[] | null> {
  return Lobby.find({ chatId: { $ne: chatId }, languageCode }).exec();
}

export function leaveLobby(chatId: number) {
  return Lobby.deleteOne({ chatId }).exec();
}

export function createChat(chatId1: number, chatId2: number, languageCode: string): Promise<IChat> {
  const chatIds = [chatId1, chatId2];
  return Chat.create({ chatIds, languageCode });
}

export function findExistingChat(chatId: number): Promise<IChat | null> {
  return Chat.findOne({ chatIds: chatId }).exec();
}

export function deleteChat(id: string) {
  return Chat.findByIdAndDelete(id).exec();
}

export function createPreviousChat(chat: IChat, closedBy: number) {
  return PreviousChat.create({
    chatIds: chat.chatIds,
    closedBy,
    languageCode: chat.languageCode,
    startDate: chat.startDate,
  });
}

export function getUserCount(): Promise<number> {
  return User.estimatedDocumentCount({}).exec();
}

export function getChatCount(): Promise<number> {
  return Chat.estimatedDocumentCount({}).exec();
}

export function getPreviousChatCount(): Promise<number> {
  return PreviousChat.estimatedDocumentCount({}).exec();
}

export function getUserPreviousChatCount(chatId: number): Promise<number> {
  return PreviousChat.countDocuments({ chatIds: chatId }).exec();
}

export function getUserPreviousChats(chatId: number): Promise<IPreviousChat[] | null> {
  return PreviousChat.find({ chatIds: chatId }).exec();
}

export function getLobbyCount(): Promise<number> {
  return Lobby.estimatedDocumentCount({}).exec();
}
