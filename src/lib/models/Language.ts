import { model, Schema, Model, Document } from 'mongoose';

export interface ILanguage extends Document {
  lang: string;
  name: string;
  native_name: string;
  fav_order?: number;
}

const LanguageSchema: Schema = new Schema({
  lang: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  native_name: { type: String, required: true },
  fav_order: { type: Number }
});

const Language: Model<ILanguage> = model<ILanguage>('Language', LanguageSchema);
export default Language
