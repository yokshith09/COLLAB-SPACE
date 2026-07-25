import { useMemo, useState } from "react";
import { useProjects } from "@/lib/api";
import { ProjectCard } from "./ProjectCard";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

const DOMAINS = ["All", "Web", "Mobile", "AI/ML", "Infra", "Design"];
const STATUSES = ["All", "OPEN", "ACTIVE", "FULL", "COMPLETED"];

export function DiscoverPage() {
  const { data: projects, isLoading } = useProjects();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => (projects ?? []).filter((p) => {
    if (p.is_private) return false;
    if (domain !== "All" && p.domain !== domain) return false;
    if (status !== "All" && p.status !== status) return false;
    if (q && !(p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()) || p.required_skills.some((s) => s.toLowerCase().includes(q.toLowerCase())))) return false;
    return true;
  }), [projects, q, domain, status]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discover Projects</h1>
        <p className="mt-1 text-muted-foreground">{filtered.length} open project{filtered.length === 1 ? "" : "s"} looking for collaborators.</p>
      </div>

      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, skills…" className="pl-9" />
          </div>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>{DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">No projects yet. Be the first to start one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
