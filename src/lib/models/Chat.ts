import { Document, model, Model, Schema } from 'mongoose';

export interface IChat extends Document {
  chatIds: number[];
  languageCode: string;
  startDate?: Date;
}

const ChatSchema: Schema = new Schema({
  chatIds: { type: [Number], required: true },
  languageCode: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
});

const Chat: Model<IChat> = model<IChat>('Chat', ChatSchema);
export default Chat;
