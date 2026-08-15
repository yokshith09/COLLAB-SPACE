"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Blog, type IUser } from "@/lib/models";
import { revalidatePath } from "next/cache";

export async function createBlog(data: { title: string; content: string; tags: string[] }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const blog = await Blog.create({
    title: data.title,
    content: data.content,
    tags: data.tags,
    authorId: user._id,
  });

  revalidatePath("/blogs");
  return { id: blog._id.toString() };
}

export async function likeBlog(blogId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const blog = await Blog.findById(blogId);
  if (!blog) return { error: "Blog not found" };

  const hasLiked = blog.likes.includes(user._id);
  if (hasLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== user._id.toString());
  } else {
    blog.likes.push(user._id);
  }

  await blog.save();
  revalidatePath("/blogs");
  return { success: true, liked: !hasLiked };
}
