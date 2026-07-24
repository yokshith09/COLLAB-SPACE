"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";

const STATUSES = ["OPEN", "FULL", "ACTIVE"];

export function SearchFilters({ domains }: { domains: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");

  function applyFilter(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (sp.get(key) === value) sp.delete(key);
    else sp.set(key, value);
    router.push(`/projects?${sp.toString()}`);
  }

  function clearFilters() {
    router.push("/projects");
    setSearch("");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("search", search);
  }

  const hasFilters = Array.from(params.keys()).length > 0;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title or description..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} type="button" title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground py-1">Domain:</span>
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => applyFilter("domain", d)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              params.get("domain") === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground py-1">Status:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => applyFilter("status", s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              params.get("status") === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
