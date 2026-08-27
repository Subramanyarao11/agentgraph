import { useId, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronDown, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Collapsible panel showing the exact parameterized Cypher an analysis page
 * just ran. The query text comes from @agentgraph/graph-schema — the same
 * constants the API's AnalysisService imports — so this can never drift
 * from what's actually executing server-side.
 */
export function CypherPanel({
  explainer,
  cypher,
  params,
}: {
  explainer: string;
  cypher: string;
  params?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelId = useId();

  const trimmed = cypher
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  async function handleCopy() {
    await navigator.clipboard.writeText(trimmed);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          Show query
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">
              <p className="mb-3 text-xs text-muted-foreground">{explainer}</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-secondary/60 p-3 font-mono text-xs leading-relaxed text-foreground">
                  <code>{trimmed}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={handleCopy}
                  aria-label="Copy query"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                </Button>
              </div>
              {params && Object.keys(params).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {Object.entries(params).map(([key, value]) => (
                    <span key={key}>
                      <code className="text-foreground">${key}</code> = {JSON.stringify(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
