import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trophy, Medal, Award } from "lucide-react";

export default async function LeaderboardPage() {
  await connectDB();
  
  // Get top 50 users sorted by points
  const topUsers = await User.find({ points: { $gt: 0 } })
    .sort({ points: -1 })
    .limit(50)
    .lean();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 pt-8 pb-4">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Top contributors and most active members in the CollabSpace community.
        </p>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border-b bg-muted/50 font-semibold text-sm text-muted-foreground">
          <div className="w-12 text-center">Rank</div>
          <div>User</div>
          <div className="text-right pr-4">Points</div>
        </div>

        <div className="divide-y">
          {topUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">
              No points awarded yet. Start collaborating to climb the ranks!
            </div>
          ) : (
            topUsers.map((u: any, index: number) => {
              const isTop3 = index < 3;
              return (
                <div 
                  key={u._id.toString()} 
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 transition-colors hover:bg-muted/30 ${isTop3 ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-12 flex justify-center">
                    {index === 0 ? <Trophy className="w-6 h-6 text-yellow-500" /> :
                     index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                     index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                     <span className="font-mono text-muted-foreground text-lg">{index + 1}</span>}
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <Link href={`/profile/${u._id.toString()}`} className="shrink-0">
                      <Avatar className={`h-12 w-12 border-2 ${isTop3 ? 'border-primary/50' : 'border-transparent'}`}>
                        <AvatarImage src={u.avatar || ""} />
                        <AvatarFallback className={isTop3 ? 'bg-primary/10 text-primary font-bold' : ''}>
                          {u.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="min-w-0">
                      <Link href={`/profile/${u._id.toString()}`} className="hover:underline">
                        <h3 className="font-semibold text-lg truncate">{u.name}</h3>
                      </Link>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(u.badges || []).slice(0, 3).map((badge: string) => (
                          <Badge key={badge} variant="secondary" className="text-[10px] px-1.5 py-0">
                            <Award className="w-3 h-3 mr-1 text-primary/70" />
                            {badge}
                          </Badge>
                        ))}
                        {(u.badges?.length || 0) > 3 && (
                          <span className="text-[10px] text-muted-foreground ml-1">+{u.badges.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right pr-4">
                    <div className="text-2xl font-bold text-primary tabular-nums tracking-tight">
                      {u.points || 0}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
