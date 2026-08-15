import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
  removedAt?: Date;
  removalReason?: string;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    role: { type: String, default: "member" },
    joinedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
    removalReason: { type: String },
  }
);

TeamMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });
TeamMemberSchema.index({ userId: 1 });
TeamMemberSchema.index({ projectId: 1 });

export const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
