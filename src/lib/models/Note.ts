import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  projectId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

NoteSchema.index({ projectId: 1 });

export const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
