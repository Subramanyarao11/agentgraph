import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  loading,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "default" | "warning" | "destructive";
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-16" />
            ) : (
              <p
                className={cn(
                  "mt-1.5 text-2xl font-semibold tabular-nums",
                  tone === "warning" && "text-warning",
                  tone === "destructive" && "text-destructive",
                )}
              >
                {value}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              tone === "default" && "bg-accent text-accent-foreground",
              tone === "warning" && "bg-warning/15 text-warning",
              tone === "destructive" && "bg-destructive/15 text-destructive",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
