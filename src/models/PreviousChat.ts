import { model, Schema, Model, Document } from 'mongoose';

export interface IPreviousChat extends Document {
  chatIds: number[];
  languageCode: string;
  startDate?: Date;
  endDate?: Date;
}

const PreviousChatSchema: Schema = new Schema({
  chatIds: { type: [Number], required: true },
  languageCode: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date, default: Date.now }
});

const PreviousChat: Model<IPreviousChat> = model('PreviousChat', PreviousChatSchema);
export default PreviousChat