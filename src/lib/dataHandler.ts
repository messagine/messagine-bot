import Debug from 'debug';
import mongoose from 'mongoose';
import config from '../config';
import Chat, { IChat } from './models/Chat';
import Lobby, { ILobby } from './models/Lobby';
import PreviousChat, { IPreviousChat } from './models/PreviousChat';
import User, { IUser } from './models/User';
const debug = Debug('lib:dataHandler');

export class DataHandler {
  public async connect(): Promise<void> {
    if (this.connected()) {
      debug('Database already connected');
      return;
    }
    await mongoose.connect(config.DB_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    debug('New database connection complete');
  }

  public getUser(chatId: number): Promise<IUser | null> {
    return User.findOne({ chatId }).exec();
  }

  public addUser(chatId: number, languageCode: string): Promise<IUser> {
    return User.create({ chatId, languageCode });
  }

  public setLanguage(chatId: number, languageCode: string) {
    return User.updateOne({ chatId }, { $set: { languageCode } }, { upsert: true }).exec();
  }

  public userBlockedChange(chatId: number, blocked: boolean) {
    return User.updateOne({ chatId }, { $set: { blocked } }).exec();
  }

  public userBannedChange(chatId: number, banned: boolean) {
    return User.updateOne({ chatId }, { $set: { banned } }).exec();
  }

  public addToLobby(chatId: number, languageCode: string): Promise<ILobby> {
    return Lobby.create({ chatId, languageCode });
  }

  public updateLobbyLanguage(chatId: number, languageCode: string) {
    return Lobby.updateOne({ chatId }, { $set: { languageCode } }).exec();
  }

  public findLobby(chatId: number): Promise<ILobby | null> {
    return Lobby.findOne({ chatId }).exec();
  }

  public leaveLobby(chatId: number) {
    return Lobby.deleteOne({ chatId }).exec();
  }

  public createChat(chatIds: number[], languageCode: string): Promise<IChat> {
    return Chat.create({ chatIds, languageCode });
  }

  public findExistingChat(chatId: number): Promise<IChat | null> {
    return Chat.findOne({ chatIds: chatId }).exec();
  }

  public deleteChat(id: string) {
    return Chat.findByIdAndDelete(id).exec();
  }

  public createPreviousChat(chat: IChat, closedBy: number) {
    return PreviousChat.create({
      chatIds: chat.chatIds,
      closedBy,
      languageCode: chat.languageCode,
      startDate: chat.startDate,
    });
  }

  public getUserCount(): Promise<number> {
    return User.estimatedDocumentCount({}).exec();
  }

  public getChatCount(): Promise<number> {
    return Chat.estimatedDocumentCount({}).exec();
  }

  public getPreviousChatCount(): Promise<number> {
    return PreviousChat.estimatedDocumentCount({}).exec();
  }

  public getUserPreviousChatCount(chatId: number): Promise<number> {
    return PreviousChat.countDocuments({ chatIds: chatId }).exec();
  }

  public getUsersPreviousChats(chatIdsToSearch: number[]): Promise<IPreviousChat[] | null> {
    return PreviousChat.find({ chatIds: { $in: chatIdsToSearch } }).exec();
  }

  public getAllLobbyUsers(): Promise<ILobby[] | null> {
    return Lobby.find({}).exec();
  }

  public getLobbyCount(): Promise<number> {
    return Lobby.estimatedDocumentCount({}).exec();
  }

  private connected() {
    return mongoose.connection.readyState === 1;
  }
}
