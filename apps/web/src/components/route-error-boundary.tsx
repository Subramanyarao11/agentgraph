import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Compass, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Root-level errorComponent — TanStack Router treats this as a true error
 * boundary: it catches any render/loader throw from a matched route and
 * replaces just that route's output, without unmounting the sidebar/shell.
 * A bug in one page no longer white-screens the whole app.
 */
export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  function tryAgain() {
    reset();
    router.invalidate();
  }

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Something went wrong on this page</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={tryAgain}>
            <RotateCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <Compass className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
