"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const STATUSES = ["OPEN", "FULL", "ACTIVE"];

export function SearchFilters({ domains }: { domains: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(search)}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.results || []);
          }
        } catch {}
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  function applyFilter(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (sp.get(key) === value) sp.delete(key);
    else sp.set(key, value);
    router.push(`/projects?${sp.toString()}`);
  }

  function clearFilters() {
    router.push("/projects");
    setSearch("");
    setSearchResults([]);
    setShowSuggestions(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("search", search);
    setShowSuggestions(false);
  }

  function selectSuggestion(project: any) {
    setSearch(project.title);
    setShowSuggestions(false);
    applyFilter("search", project.title);
  }

  const hasFilters = Array.from(params.keys()).length > 0;

  return (
    <div className="space-y-3 relative">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title or description..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} type="button" title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {showSuggestions && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((project) => (
            <button
              key={project.id}
              onClick={() => selectSuggestion(project)}
              className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <div className="font-medium truncate">{project.title}</div>
              <div className="text-xs text-muted-foreground truncate">{project.description}</div>
            </button>
          ))}
        </div>
      )}

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
