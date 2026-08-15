"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { createBlog, likeBlog } from "@/actions/blog";
import { timeAgo } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function BlogFeed({ initialBlogs }: { initialBlogs: any[] }) {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    const res = await createBlog({ title, content, tags: tagArray });
    setPosting(false);
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "Blog posted!" });
      setTitle("");
      setContent("");
      setTags("");
      window.location.reload();
    }
  }

  async function handleLike(blogId: string) {
    const original = [...blogs];
    setBlogs(blogs.map(b => b.id === blogId ? { ...b, hasLiked: !b.hasLiked, likesCount: b.hasLiked ? b.likesCount - 1 : b.likesCount + 1 } : b));
    const res = await likeBlog(blogId);
    if (res.error) {
      setBlogs(original);
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border bg-card space-y-4 shadow-sm">
        <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Write a Blog</h3>
        <Input placeholder="Blog Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea 
          placeholder="Share your thoughts, experiences, or project updates... (Markdown supported)" 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          rows={4}
        />
        <Input placeholder="Tags (comma separated, e.g. web, tutorial, react)" value={tags} onChange={e => setTags(e.target.value)} />
        <Button onClick={handlePost} disabled={posting || !title.trim() || !content.trim()}>
          {posting ? "Publishing..." : "Publish Blog"}
        </Button>
      </div>

      <div className="space-y-6">
        {blogs.map(blog => (
          <div key={blog.id} className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={blog.author.avatar || ""} />
                <AvatarFallback>{blog.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{blog.author.name}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(blog.createdAt)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
              <div className="text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-primary [&_a]:underline">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </div>
            </div>

            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {blog.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="font-normal text-xs">#{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <button 
                onClick={() => handleLike(blog.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${blog.hasLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${blog.hasLiked ? 'fill-rose-500' : ''}`} />
                {blog.likesCount}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/blogs#${blog.id}`);
                  toast({ title: "Link copied!" });
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div className="text-center p-12 border rounded-xl bg-muted/20 text-muted-foreground">
            No blogs posted yet. Be the first to share!
          </div>
        )}
      </div>
    </div>
  );
}
