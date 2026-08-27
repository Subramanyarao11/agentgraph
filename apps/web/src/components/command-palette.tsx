import { useEffect, useId, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import type { NodeLabel } from "@agentgraph/graph-schema";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearch } from "@/hooks/use-search";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "agentgraph:open-search";

/** Lets the sidebar's visible search button open the same palette as ⌘K. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * Global ⌘K / Ctrl+K search over every Agent/Tool/Workflow/Dataset/Person,
 * backed by CognoDB's fulltext index (see FULLTEXT_SEARCH_QUERY) — the one
 * headline CognoDB capability the rest of the app doesn't otherwise touch.
 *
 * Full ARIA combobox pattern (role, aria-activedescendant) plus Up/Down to
 * move, Enter to open the highlighted result — not just a mouse-click list.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedTerm = useDebouncedValue(term, 200);
  const navigate = useNavigate();
  const results = useSearch(debouncedTerm);
  const listboxId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const items = results.data ?? [];

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

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length, debouncedTerm]);

  useEffect(() => {
    listRef.current?.querySelector(`#${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  function goTo(label: NodeLabel, id: string) {
    navigate({ to: "/catalog/$label/$id", params: { label, id } });
    setOpen(false);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      const active = items[activeIndex];
      if (active) {
        e.preventDefault();
        goTo(active.node.label, String(active.node.properties.id));
      }
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated transition-[opacity,transform] duration-150 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Search AgentGraph</DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
              role="combobox"
              aria-expanded={items.length > 0}
              aria-controls={listboxId}
              aria-activedescendant={items.length > 0 ? `${listboxId}-option-${activeIndex}` : undefined}
              autoComplete="off"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search agents, tools, workflows, datasets, people…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {results.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />}
          </div>

          <div ref={listRef} id={listboxId} role="listbox" className="max-h-80 overflow-y-auto p-2">
            {term.trim().length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Type to search across the whole graph.
              </p>
            ) : items.length === 0 && !results.isFetching ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches for "{term}".</p>
            ) : (
              items.map((r, i) => {
                const display = NODE_DISPLAY[r.node.label];
                return (
                  <button
                    key={r.node.id}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goTo(r.node.label, String(r.node.properties.id))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      i === activeIndex && "bg-accent text-accent-foreground",
                    )}
                  >
                    <display.icon className={`h-4 w-4 shrink-0 ${display.color}`} aria-hidden="true" />
                    <span className="flex-1 truncate">{nodeName(r.node.properties)}</span>
                    <span className="text-xs text-tertiary-foreground">{r.node.label}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-tertiary-foreground">
            <span>Full-text search over CognoDB's fulltext index</span>
            <span className="flex items-center gap-2">
              <kbd className="rounded border border-border px-1.5 py-0.5">↑↓ to navigate</kbd>
              <kbd className="rounded border border-border px-1.5 py-0.5">esc to close</kbd>
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
