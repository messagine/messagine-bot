import { model, Schema, Model, Document } from 'mongoose';

export interface ILanguage extends Document {
  lang: string;
  name: string;
  native_name: string;
}

const LanguageSchema: Schema = new Schema({
  lang: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  native_name: { type: String, required: true }
});

const Language: Model<ILanguage> = model<ILanguage>('Language', LanguageSchema);
export default Language
