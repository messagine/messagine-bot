import { model, Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
	chatId: number;
	languageCode: string;
}

const UserSchema: Schema = new Schema({
	chatId: { type: Number, required: true, unique: true },
	languageCode: { type: String, required: true },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
export default User;
