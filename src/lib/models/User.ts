import { Document, model, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  admin?: boolean;
  banned?: boolean;
  chatId: number;
  blocked?: boolean;
  languageCode: string;
  lastActivity?: Date;
  nextReminder?: Date;
}

const UserSchema: Schema = new Schema({
  admin: { type: Boolean },
  banned: { type: Boolean },
  blocked: { type: Boolean },
  chatId: { type: Number, required: true, unique: true },
  languageCode: { type: String, required: true },
  lastActivity: { type: Date },
  nextReminder: { type: Date },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
export default User;
