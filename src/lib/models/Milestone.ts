import mongoose, { Schema, Document, Model } from "mongoose";

export type MilestoneStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

export interface IMilestoneDeliverable {
  id: string;
  title: string;
  completed: boolean;
}

export interface IMilestone extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  targetDays: number;
  targetDate?: Date;
  status: MilestoneStatus;
  deliverables: IMilestoneDeliverable[];
  progress: number;
  lastRemindedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    targetDays: { type: Number, required: true, default: 7 },
    targetDate: { type: Date },
    status: {
      type: String,
      enum: ["UPCOMING", "IN_PROGRESS", "COMPLETED"],
      default: "UPCOMING",
    },
    deliverables: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    lastRemindedAt: { type: Date },
  },
  { timestamps: true }
);

MilestoneSchema.index({ projectId: 1, order: 1 });
MilestoneSchema.index({ status: 1, lastRemindedAt: 1 });

export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone || mongoose.model<IMilestone>("Milestone", MilestoneSchema);
