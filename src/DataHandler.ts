import mongoose from 'mongoose';
import Lobby, { ILobby } from './models/Lobby';
import Chat, { IChat } from './models/Chat';

export class DataHandler {
  /**
   * connect
   */
  public connect() {
    return mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  public addToLobby(chatId: number) {
    return Lobby.create({ chatId });
  }

  public findLobby(chatId: number): Promise<ILobby> {
    return Lobby.findOne({ chatId });
  }

  public findOpponentInLobby(chatId: number): Promise<ILobby> {
    return Lobby.findOne({ chatId: { $ne: chatId } });
  }

  public leaveLobby(chatId: number) {
    return Lobby.deleteOne({ chatId });
  }

  public createChat(chatId1: number, chatId2: number) {
    const chatIds = [chatId1, chatId2]
    return Chat.create({ chatIds });
  }

  public findExistingChat(chatId: number): Promise<IChat> {
    return Chat.findOne({ chatIds: chatId });
  }

  public deleteChat(id: string) {
    return Chat.findByIdAndDelete(id);
  }
}