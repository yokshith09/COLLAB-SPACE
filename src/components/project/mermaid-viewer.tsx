"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy, ZoomIn, ZoomOut, RotateCcw, Check, Sparkles } from "lucide-react";

interface Props {
  chart: string;
  title?: string;
}

export function MermaidViewer({ chart, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadMermaid(): Promise<any> {
      if (typeof window === "undefined") return null;

      // Check if already loaded on window
      if ((window as any).mermaid) {
        return (window as any).mermaid;
      }

      return new Promise((resolve, reject) => {
        const existingScript = document.getElementById("mermaid-cdn-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve((window as any).mermaid));
          if ((window as any).mermaid) resolve((window as any).mermaid);
          return;
        }

        const script = document.createElement("script");
        script.id = "mermaid-cdn-script";
        script.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
        script.async = true;
        script.onload = () => {
          if ((window as any).mermaid) {
            resolve((window as any).mermaid);
          } else {
            reject(new Error("Mermaid failed to initialize"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load Mermaid from CDN"));
        document.head.appendChild(script);
      });
    }

    async function renderChart() {
      if (!chart?.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const mermaid = await loadMermaid();

        if (!mermaid) {
          throw new Error("Mermaid library unavailable");
        }

        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          themeVariables: {
            fontFamily: "inherit",
            primaryColor: "#0f766e",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#0f766e",
            lineColor: "#64748b",
            secondaryColor: "#f1f5f9",
            tertiaryColor: "#ffffff",
          },
          securityLevel: "loose",
        });

        const id = "mermaid-" + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, chart);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: any) {
        console.warn("Mermaid render error:", err);
        if (isMounted) {
          setError(err?.message || "Visual diagram rendering error");
          setLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  function handleCopy() {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    toast({ title: "Diagram code copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      {title && (
        <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-mono"
              onClick={() => setZoom(1)}
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs gap-1 ml-2"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Code"}
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="p-6 overflow-x-auto min-h-[260px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 transition-all"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Synthesizing visual architecture...</span>
          </div>
        ) : error ? (
          <div className="w-full space-y-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Visual diagram syntax view:
            </p>
            <pre className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto text-foreground">
              {chart}
            </pre>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
