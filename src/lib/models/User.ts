import mongoose, { Schema, Document, Model } from "mongoose";

export type UserPlan = "FREE" | "PRO";

export interface IUserAIUsage {
  ideaValidations: number;
  prdGenerations: number;
  milestoneGenerations: number;
  lastResetAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  skills: string[];
  domains: string[];
  points: number;
  badges: string[];
  endorsements: { skill: string; endorsers: string[] }[];
  plan: UserPlan;
  planExpiresAt?: Date;
  aiUsage: IUserAIUsage;
  lastLoginAt: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: { type: String },
    bio: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    resumeUrl: { type: String },
    skills: [{ type: String }],
    domains: [{ type: String }],
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    endorsements: [
      {
        skill: { type: String, required: true },
        endorsers: [{ type: String }],
      },
    ],
    plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
    planExpiresAt: { type: Date },
    aiUsage: {
      ideaValidations: { type: Number, default: 0 },
      prdGenerations: { type: Number, default: 0 },
      milestoneGenerations: { type: Number, default: 0 },
      lastResetAt: { type: Date, default: Date.now },
    },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ plan: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
