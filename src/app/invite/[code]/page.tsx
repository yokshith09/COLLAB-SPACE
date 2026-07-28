import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.user?.id || null;
  } catch {
    userId = null;
  }

  const project = await safeDbQuery(
    () =>
      prisma.project.findUnique({
        where: { inviteCode: code },
        include: { team: true, owner: { select: { name: true } } },
      }),
    null
  );

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground">This invite link is invalid or expired.</p>
          <Link href="/projects"><Button variant="outline">Browse Projects</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-xl border bg-card text-center space-y-4">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground">by {project.owner.name}</p>
        <p className="text-sm text-muted-foreground">
          {project.team.length}/{project.teamSizeMax} members · {project.status}
        </p>
        {!userId ? (
          <div className="space-y-2 pt-2">
            <Link href="/sign-up"><Button className="w-full">Sign up to join</Button></Link>
            <Link href="/sign-in"><Button variant="outline" className="w-full">Sign in</Button></Link>
          </div>
        ) : (
          <Link href={`/projects/${project.id}`}>
            <Button className="w-full">View Project</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
