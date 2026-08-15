import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

const ALL_SKILLS = ["React","TypeScript","Python","Node.js","UI/UX Design","MongoDB","Docker","Machine Learning","Mobile Dev","Solidity","Rust","Go","AWS","GraphQL","Next.js"];
const ALL_DOMAINS = ["Web Dev","AI/ML","Mobile","Blockchain","DevOps","Data Science","Design","Open Source","IoT","SaaS"];

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  await connectDB();
  let user = await User.findOne({ email: session.user.email });
  if (!user) {
    user = await User.create({
      name: session.user.name || "Anonymous",
      email: session.user.email,
      avatar: session.user.image || undefined,
    });
  }

  const userData = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    githubUrl: user.githubUrl ?? null,
    linkedinUrl: user.linkedinUrl ?? null,
    resumeUrl: user.resumeUrl ?? null,
    skills: user.skills.map((s: string) => ({ name: s })),
    domains: user.domains.map((d: string) => ({ name: d })),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">Update your profile information</p>
      </div>
      <ProfileEditForm user={userData} allSkills={ALL_SKILLS} allDomains={ALL_DOMAINS} />
    </div>
  );
}
