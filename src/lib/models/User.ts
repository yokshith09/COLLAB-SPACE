import mongoose, { Schema, Document, Model } from "mongoose";

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
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
