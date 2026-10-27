// Contiene la palabra que contiene los ejemplo de tatoebe d
import { Schema, model, Document, Types } from "mongoose";

// informacion la traduccion 
interface IContextSentence {
  sentence: string;
  translation?: string;
  source: "tatoeba" | "mymemory" | "manual";
  sourceId?: string;
}

export interface IWord extends Document {
  term: string;
  translation: string;
  sourceLang: "en" | "es";
  contextSentences: IContextSentence[];
  folders: Types.ObjectId[];
  tags: string[];        // etiquetas manuales, creadas por ti
  aiTag: string | null;  // etiqueta sugerida por el LLM de Hugging Face
  createdAt: Date;
  updatedAt: Date;
}

const contextSentenceSchema = new Schema<IContextSentence>(
  {
    sentence: { type: String, required: true, trim: true },
    translation: { type: String, trim: true },
    source: { type: String, enum: ["tatoeba", "mymemory", "manual"], required: true },
    sourceId: { type: String },
  },
  { _id: false }
);

const wordSchema = new Schema<IWord>(
  {
    term: { type: String, required: true, trim: true, index: true },
    translation: { type: String, required: true, trim: true },
    sourceLang: { type: String, enum: ["en", "es"], required: true },
    contextSentences: { type: [contextSentenceSchema], default: [] },
    folders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => tags.map((t) => t.toLowerCase().trim()),
    },
    aiTag: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export const Word = model<IWord>("Word", wordSchema);