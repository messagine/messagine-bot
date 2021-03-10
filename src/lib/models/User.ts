import { Document, model, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  banned?: boolean;
  chatId: number;
  blocked?: boolean;
  languageCode: string;
}

const UserSchema: Schema = new Schema({
  banned: { type: Boolean },
  blocked: { type: Boolean },
  chatId: { type: Number, required: true, unique: true },
  languageCode: { type: String, required: true },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
export default User;
