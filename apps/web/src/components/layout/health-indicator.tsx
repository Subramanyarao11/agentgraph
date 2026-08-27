import type { CSSProperties } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useHealth } from "@/hooks/use-health";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function HealthIndicator() {
  const { data, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <span role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Checking systems…
      </span>
    );
  }

  const allUp = !isError && data?.status === "up";
  const label = isError ? "API unreachable" : allUp ? "All systems up" : "Degraded";

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              allUp
                ? "border-success/30 bg-success/10 text-success-text"
                : "border-destructive/30 bg-destructive/10 text-destructive-text",
            )}
          >
            {allUp ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {label}
            <span
              aria-hidden="true"
              className="animate-pulse-dot h-1.5 w-1.5 rounded-full"
              style={
                {
                  backgroundColor: allUp ? "hsl(var(--success))" : "hsl(var(--destructive))",
                  "--pulse-color": allUp ? "var(--success)" : "var(--destructive)",
                } as CSSProperties
              }
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {data ? (
            <div className="space-y-0.5">
              <p>Graph: {data.components.graph}</p>
              <p>Postgres: {data.components.postgres}</p>
              <p>Redis: {data.components.redis}</p>
            </div>
          ) : (
            <p>Could not reach the API.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
