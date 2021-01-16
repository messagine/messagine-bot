import { model, Schema, Model, Document } from 'mongoose';

export interface ILobby extends Document {
  chatId: number;
}

const LobbySchema: Schema = new Schema({
  chatId: { type: Number, required: true, unique: true }
});

const Lobby: Model<ILobby> = model('Lobby', LobbySchema);
export default Lobby