import mongoose from 'mongoose';
import config from '../config';
import Chat, { IChat } from './models/Chat';
import Language, { ILanguage } from './models/Language';
import Lobby, { ILobby } from './models/Lobby';
import PreviousChat from './models/PreviousChat';
import User, { IUser } from './models/User';

export class DataHandler {
  public connect() {
    if (this.connected()) return;
    return mongoose.connect(config.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  private connected() {
    return mongoose.connection.readyState === 1;
  }

  public getUser(chatId: number): Promise<IUser | null> {
    return User.findOne({ chatId }).exec();
  }

  public addUser(chatId: number, languageCode: string): Promise<IUser> {
    return User.create({ chatId, languageCode });
  }

  public getLanguage(languageCode: string): Promise<ILanguage | null> {
    return Language.findOne({ lang: languageCode }).exec();
  }

  public getLanguages(): Promise<ILanguage[]> {
    return Language.find({}).sort({ name: 'asc' }).exec();
  }

  public setLanguage(chatId: number, languageCode: string) {
    return User.updateOne(
      { chatId },
      { $set: { languageCode } },
      { upsert: true }
    ).exec();
  }

  public addToLobby(chatId: number, languageCode: string): Promise<ILobby> {
    return Lobby.create({ chatId, languageCode });
  }

  public findLobby(chatId: number) : Promise<ILobby | null>{
    return Lobby.findOne({ chatId }).exec();
  }

  public findOpponentInLobby(chatId: number, languageCode: string): Promise<ILobby | null> {
    return Lobby.findOne({ chatId: { $ne: chatId }, languageCode }).exec();
  }

  public leaveLobby(chatId: number) {
    return Lobby.deleteOne({ chatId }).exec();
  }

  public createChat(chatId1: number, chatId2: number, languageCode: string): Promise<IChat> {
    const chatIds = [chatId1, chatId2]
    return Chat.create({ chatIds, languageCode });
  }

  public findExistingChat(chatId: number): Promise<IChat | null> {
    return Chat.findOne({ chatIds: chatId }).exec();
  }

  public deleteChat(id: string) {
    return Chat.findByIdAndDelete(id).exec();
  }

  public createPreviousChat(chatIds: number[], languageCode: string, closedBy: number, startDate?: Date) {
    return PreviousChat.create({ chatIds, languageCode, closedBy, startDate });
  }
}
