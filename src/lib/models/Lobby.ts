import { Document, model, Model, Schema } from 'mongoose';

export interface ILobby extends Document {
  chatId: number;
  entranceDate: Date;
  languageCode: string;
}

const LobbySchema: Schema = new Schema({
  chatId: { type: Number, required: true, unique: true },
  entranceDate: { type: Date, default: Date.now },
  languageCode: { type: String, required: true },
});

const Lobby: Model<ILobby> = model<ILobby>('Lobby', LobbySchema);
export default Lobby;
