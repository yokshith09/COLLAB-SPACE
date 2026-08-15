import mongoose, { Schema, Document, Model } from "mongoose";

export type AppStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  message: string;
  roleRequested?: string;
  availability?: string;
  resumeUrl?: string;
  status: AppStatus;
  expiresAt: Date;
  messages: { senderId: mongoose.Types.ObjectId; content: string; createdAt: Date }[];
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    message: { type: String, required: true },
    roleRequested: { type: String },
    availability: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, projectId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ expiresAt: 1 });
ApplicationSchema.index({ projectId: 1 });

export const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
