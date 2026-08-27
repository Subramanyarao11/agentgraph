import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import type { NodeLabel } from "@agentgraph/graph-schema";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearch } from "@/hooks/use-search";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";

const OPEN_EVENT = "agentgraph:open-search";

/** Lets the sidebar's visible search button open the same palette as ⌘K. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * Global ⌘K / Ctrl+K search over every Agent/Tool/Workflow/Dataset/Person,
 * backed by CognoDB's fulltext index (see FULLTEXT_SEARCH_QUERY) — the one
 * headline CognoDB capability the rest of the app doesn't otherwise touch.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term, 200);
  const navigate = useNavigate();
  const results = useSearch(debouncedTerm);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpenRequest() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  function goTo(label: NodeLabel, id: string) {
    navigate({ to: "/catalog/$label/$id", params: { label, id } });
    setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-xl transition-[opacity,transform] duration-150 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Search AgentGraph</DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search agents, tools, workflows, datasets, people…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {results.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {term.trim().length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Type to search across the whole graph.
              </p>
            ) : results.data?.length === 0 && !results.isFetching ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches for "{term}".</p>
            ) : (
              results.data?.map((r) => {
                const display = NODE_DISPLAY[r.node.label];
                return (
                  <button
                    key={r.node.id}
                    type="button"
                    onClick={() => goTo(r.node.label, String(r.node.properties.id))}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <display.icon className={`h-4 w-4 shrink-0 ${display.color}`} />
                    <span className="flex-1 truncate">{nodeName(r.node.properties)}</span>
                    <span className="text-xs text-muted-foreground">{r.node.label}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>Full-text search over CognoDB's fulltext index</span>
            <kbd className="rounded border border-border px-1.5 py-0.5">esc to close</kbd>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
