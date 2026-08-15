import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  senderId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  { 
    content: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ projectId: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
