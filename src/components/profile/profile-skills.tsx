"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import { endorseSkill } from "@/actions/user";
import { useToast } from "@/components/ui/use-toast";

interface ProfileSkillsProps {
  userId: string;
  skills: string[];
  endorsements: { skill: string; endorsers: string[] }[];
  currentUserId?: string;
  canEndorse: boolean;
}

export function ProfileSkills({ userId, skills, endorsements, currentUserId, canEndorse }: ProfileSkillsProps) {
  const { toast } = useToast();
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);

  const getEndorsersCount = (skill: string) => {
    return endorsements?.find(e => e.skill === skill)?.endorsers.length || 0;
  };

  const hasEndorsed = (skill: string) => {
    if (!currentUserId) return false;
    return endorsements?.find(e => e.skill === skill)?.endorsers.includes(currentUserId) || false;
  };

  const handleEndorse = async (skill: string) => {
    setLoadingSkill(skill);
    const res = await endorseSkill(userId, skill);
    setLoadingSkill(null);

    if (res?.error) {
      toast({ title: "Failed to endorse", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "Endorsement added", description: `You endorsed ${skill}` });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => {
        const count = getEndorsersCount(skill);
        const endorsedByMe = hasEndorsed(skill);

        return (
          <Badge key={skill} variant="secondary" className="px-1 py-1 font-medium bg-secondary/50 flex items-center gap-1.5 overflow-hidden">
            <span className="pl-2">{skill}</span>
            {count > 0 && (
              <span className="bg-primary/20 text-primary px-1.5 rounded-full text-[10px]">
                {count}
              </span>
            )}
            {canEndorse && !endorsedByMe && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 ml-1 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                onClick={() => handleEndorse(skill)}
                disabled={loadingSkill === skill}
              >
                {loadingSkill === skill ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </Button>
            )}
            {canEndorse && endorsedByMe && (
              <div className="h-5 w-5 ml-1 flex items-center justify-center text-primary bg-primary/10 rounded-full">
                <Check className="h-3 w-3" />
              </div>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
