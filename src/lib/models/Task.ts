import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TaskSchema.index({ projectId: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
