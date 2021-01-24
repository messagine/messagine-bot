import { model, Schema, Model, Document } from 'mongoose';

export interface ILobby extends Document {
	chatId: number;
	languageCode: string;
	entranceDate: Date;
}

const LobbySchema: Schema = new Schema({
	chatId: { type: Number, required: true, unique: true },
	languageCode: { type: String, required: true },
	entranceDate: { type: Date, default: Date.now },
});

const Lobby: Model<ILobby> = model<ILobby>('Lobby', LobbySchema);
export default Lobby;
