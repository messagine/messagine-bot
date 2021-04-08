import { Document, model, Model, Schema } from 'mongoose';

export interface IPreviousChat extends Document {
  admin?: boolean;
  chatIds: number[];
  closedBy: number;
  endDate?: Date;
  languageCode: string;
  startDate?: Date;
}

const PreviousChatSchema: Schema = new Schema({
  admin: { type: Boolean },
  chatIds: { type: [Number], required: true },
  closedBy: { type: Number, required: true },
  endDate: { type: Date, default: Date.now },
  languageCode: { type: String, required: true },
  startDate: { type: Date },
});

const PreviousChat: Model<IPreviousChat> = model<IPreviousChat>('PreviousChat', PreviousChatSchema);
export default PreviousChat;
