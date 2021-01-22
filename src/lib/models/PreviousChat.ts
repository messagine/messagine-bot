import { model, Schema, Model, Document } from 'mongoose';

export interface IPreviousChat extends Document {
  chatIds: number[];
  languageCode: string;
  closedBy: number;
  startDate?: Date;
  endDate?: Date;
}

const PreviousChatSchema: Schema = new Schema({
  chatIds: { type: [Number], required: true },
  languageCode: { type: String, required: true },
  closedBy: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date, default: Date.now }
});

const PreviousChat: Model<IPreviousChat> = model<IPreviousChat>('PreviousChat', PreviousChatSchema);
export default PreviousChat
