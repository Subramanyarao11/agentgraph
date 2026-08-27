import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import type { GraphNodeDto, NodeLabel } from "@agentgraph/graph-schema";
import { useCatalogList } from "@/hooks/use-catalog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";
import { nodeName } from "@/lib/node-display";
import { cn } from "@/lib/utils";

/**
 * Type-to-search picker over a node label's catalog. Not a Radix Select
 * (which needs a static item list) — this queries /catalog/:label as the
 * user types, which is what lets it stay usable once a label has
 * thousands of nodes instead of only the first page.
 *
 * Implements the ARIA combobox pattern by hand (role, aria-expanded,
 * aria-activedescendant, arrow-key + Enter/Escape) since this isn't a
 * static-option-list Radix component.
 */
export function NodePicker({
  id,
  label,
  value,
  onSelect,
  placeholder,
}: {
  id?: string;
  label: NodeLabel;
  value: GraphNodeDto | null;
  onSelect: (node: GraphNodeDto) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query, 200);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const results = useCatalogList(label, { limit: 8, search: debouncedQuery || undefined });
  const items = results.data?.items ?? [];

  function selectItem(item: GraphNodeDto) {
    onSelect(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        selectItem(items[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          value={open ? query : value ? nodeName(value.properties) : ""}
          placeholder={placeholder ?? `Search ${label.toLowerCase()}s…`}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setActiveIndex(-1);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pr-8"
        />
        <ChevronsUpDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md"
          >
            {results.isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Searching…
              </div>
            ) : items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">No matches.</p>
            ) : (
              items.map((item, i) => (
                <button
                  type="button"
                  id={`${listboxId}-option-${i}`}
                  role="option"
                  aria-selected={value?.id === item.id}
                  key={item.id}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    i === activeIndex && "bg-accent text-accent-foreground",
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectItem(item);
                  }}
                >
                  {nodeName(item.properties)}
                  {value?.id === item.id && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              ))
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
