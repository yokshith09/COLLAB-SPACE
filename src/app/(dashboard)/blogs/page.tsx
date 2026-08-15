import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Blog } from "@/lib/models";
import { BlogFeed } from "@/components/blogs/blog-feed";
import { RecentTrends } from "@/components/blogs/recent-trends";

export default async function BlogsPage() {
  const session = await auth();
  await connectDB();

  let currentUser: any = null;
  if (session?.user?.email) {
    currentUser = await User.findOne({ email: session.user.email }).select("_id").lean();
  }

  const rawBlogs = await Blog.find()
    .sort({ createdAt: -1 })
    .populate("authorId", "name avatar")
    .lean();

  const blogs = (rawBlogs as any[]).map((b) => ({
    id: b._id.toString(),
    title: b.title,
    content: b.content,
    tags: b.tags || [],
    likesCount: b.likes.length,
    hasLiked: currentUser ? b.likes.some((id: any) => id.toString() === currentUser._id.toString()) : false,
    createdAt: b.createdAt,
    author: {
      id: b.authorId._id.toString(),
      name: b.authorId.name,
      avatar: b.authorId.avatar,
    },
  }));

  // Simple trends algorithm: count tag frequency in the latest blogs
  const tagCounts: Record<string, number> = {};
  blogs.forEach(b => {
    b.tags.forEach((t: string) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const trends = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Community Blogs</h1>
        <BlogFeed initialBlogs={blogs} />
      </div>
      <div>
        <RecentTrends trends={trends} />
      </div>
    </div>
  );
}
