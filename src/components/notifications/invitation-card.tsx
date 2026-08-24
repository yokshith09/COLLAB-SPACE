"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { respondToCollaborationInvite } from "@/actions/application";
import Link from "next/link";
import { Check, X, Users, ArrowRight } from "lucide-react";

interface Props {
  invite: {
    id: string;
    projectId: string;
    projectTitle: string;
    message: string;
    roleRequested?: string;
    status: string;
    invitedByName: string;
    invitedByAvatar?: string;
    createdAt: string | Date;
  };
}

export function InvitationCard({ invite }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invite.status);

  async function handleResponse(accept: boolean) {
    setLoading(true);
    const res = await respondToCollaborationInvite(invite.id, accept);
    setLoading(false);

    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    } else {
      setStatus(accept ? "ACCEPTED" : "REJECTED");
      toast({
        title: accept ? "Welcome to the team! 🎉" : "Invitation declined",
        description: accept ? `You are now a collaborator on "${invite.projectTitle}".` : undefined,
      });
      router.refresh();
    }
  }

  return (
    <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border shrink-0">
          <AvatarImage src={invite.invitedByAvatar || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {invite.invitedByName?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/projects/${invite.projectId}`}
              className="font-semibold text-base hover:text-primary transition-colors flex items-center gap-1"
            >
              {invite.projectTitle}
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
            <Badge
              variant={status === "ACCEPTED" ? "default" : status === "REJECTED" ? "outline" : "secondary"}
              className="text-[10px]"
            >
              {status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invited by <span className="font-medium text-foreground">{invite.invitedByName}</span>
            {invite.roleRequested && ` as ${invite.roleRequested}`}
          </p>
          <p className="text-xs text-foreground/80 italic mt-2 bg-muted/40 p-2 rounded border">
            &ldquo;{invite.message}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {status === "PENDING" ? (
          <>
            <Button
              size="sm"
              onClick={() => handleResponse(true)}
              disabled={loading}
              className="gap-1.5 text-xs h-8"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResponse(false)}
              disabled={loading}
              className="gap-1.5 text-xs h-8"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
          </>
        ) : status === "ACCEPTED" ? (
          <Link href={`/team/${invite.projectId}`}>
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs h-8">
              <Users className="w-3.5 h-3.5" /> Team Workspace
            </Button>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Declined</span>
        )}
      </div>
    </div>
  );
}
