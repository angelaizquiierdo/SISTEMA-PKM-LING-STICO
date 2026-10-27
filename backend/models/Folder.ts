// Base de datos de carpetas que contiene la información de las carpetas 

import { Schema, model, Document, Types } from "mongoose";

export interface IFolder extends Document {
  name: string;
  mediaType: string;
  parentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    mediaType: {
      type: String,
      trim: true,
      lowercase: true,
      default: "sin clasificar",
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export const Folder = model<IFolder>("Folder", folderSchema);
