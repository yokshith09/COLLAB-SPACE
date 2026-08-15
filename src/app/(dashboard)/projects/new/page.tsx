import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Project } from "@/lib/models";
import { CreateProjectForm } from "@/components/project/create-project-form";

const SKILLS = ["React","TypeScript","Python","Node.js","UI/UX Design","MongoDB","Docker","Machine Learning","Mobile Dev","Solidity","Rust","Go","AWS","GraphQL","Next.js"];
const DOMAINS = ["Web Dev","AI/ML","Mobile","Blockchain","DevOps","Data Science","Design","Open Source","IoT","SaaS"];

export default async function NewProjectPage() {
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

  const activeCount = await Project.countDocuments({
    ownerId: user._id,
    status: { $in: ["OPEN", "FULL", "ACTIVE"] },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-sm text-muted-foreground">
          {activeCount} of 3 active projects used
          {activeCount >= 3 && <span className="text-red-500 ml-1">(max reached)</span>}
        </p>
      </div>
      {activeCount >= 3 ? (
        <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-sm">
          You have 3 active projects. Complete or close one before starting another.
        </div>
      ) : (
        <CreateProjectForm
          skills={SKILLS}
          domains={DOMAINS}
          activeCount={activeCount}
          maxActive={3}
          userId={user._id.toString()}
        />
      )}
    </div>
  );
}
