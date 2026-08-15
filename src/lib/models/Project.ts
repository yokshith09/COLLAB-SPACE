import mongoose, { Schema, Document, Model } from "mongoose";

export type ProjectStatus = "OPEN" | "FULL" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  problemStatement: string;
  requiredSkills: string[];
  teamSizeMax: number;
  status: ProjectStatus;
  deadline?: Date;
  isPrivate: boolean;
  inviteCode?: string;
  githubUrl?: string;
  demoUrl?: string;
  gallery?: string[];
  ownerId: mongoose.Types.ObjectId;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    requiredSkills: [{ type: String }],
    teamSizeMax: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["OPEN", "FULL", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },
    deadline: { type: Date },
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true, sparse: true },
    githubUrl: { type: String },
    demoUrl: { type: String },
    gallery: [{ type: String }],
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String, required: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ domain: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
