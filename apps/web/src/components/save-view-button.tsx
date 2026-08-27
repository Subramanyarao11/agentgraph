import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import type { SavedViewType } from "@agentgraph/graph-schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateSavedView } from "@/hooks/use-views";

export function SaveViewButton({
  type,
  params,
  defaultName,
}: {
  type: SavedViewType;
  params: Record<string, unknown>;
  defaultName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const create = useCreateSavedView();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setName(defaultName)}>
          <Bookmark className="h-3.5 w-3.5" /> Save view
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this analysis</DialogTitle>
          <DialogDescription>Bookmark it to re-run later from Saved Views.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="View name" />
          <Button
            className="w-full"
            disabled={!name.trim() || create.isPending}
            onClick={() =>
              create.mutate(
                { name: name.trim(), type, params },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            {create.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
