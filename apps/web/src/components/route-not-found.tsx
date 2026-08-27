import { Link } from "@tanstack/react-router";
import { Compass, SearchX } from "lucide-react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";

export function RouteNotFound() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
      <m.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-xl border border-dashed border-border p-6 text-center"
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
          <SearchX className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">That link doesn't match anything in AgentGraph.</p>
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </m.div>
    </div>
  );
}
