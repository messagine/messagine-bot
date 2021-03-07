import { Document, model, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  chatId: number;
  languageCode: string;
  blocked?: boolean;
}

const UserSchema: Schema = new Schema({
  blocked: { type: Boolean },
  chatId: { type: Number, required: true, unique: true },
  languageCode: { type: String, required: true },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
export default User;
