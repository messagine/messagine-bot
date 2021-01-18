import { model, Schema, Model, Document } from 'mongoose';

export interface IChat extends Document {
  chatIds: number[];
  languageCode: string;
}

const ChatSchema: Schema = new Schema({
  chatIds: { type: [Number], required: true },
  languageCode: { type: String, required: true }
});

const Chat: Model<IChat> = model('Chat', ChatSchema);
export default Chat