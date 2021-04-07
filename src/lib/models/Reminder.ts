import { Document, model, Model, Schema } from 'mongoose';

export interface IReminder extends Document {
  chatId: number;
  date: Date;
  state: string;
}

const ReminderSchema: Schema = new Schema({
  chatId: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  state: { type: String, required: true },
});

const Reminder: Model<IReminder> = model<IReminder>('Reminder', ReminderSchema);
export default Reminder;
