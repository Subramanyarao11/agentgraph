import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
 */
export function NodePicker({
  label,
  value,
  onSelect,
  placeholder,
}: {
  label: NodeLabel;
  value: GraphNodeDto | null;
  onSelect: (node: GraphNodeDto) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useCatalogList(label, { limit: 8, search: debouncedQuery || undefined });

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={open ? query : value ? nodeName(value.properties) : ""}
          placeholder={placeholder ?? `Search ${label.toLowerCase()}s…`}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pr-8"
        />
        <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md"
          >
            {results.isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
              </div>
            ) : results.data?.items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">No matches.</p>
            ) : (
              results.data?.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  {nodeName(item.properties)}
                  {value?.id === item.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
