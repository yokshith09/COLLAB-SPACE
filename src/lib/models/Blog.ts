import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ tags: 1 });

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
