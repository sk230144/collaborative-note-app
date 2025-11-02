"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Note } from '@/lib/types';
import { History, RotateCcw } from 'lucide-react';
import { useNotes } from '@/context/notes-provider';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

type VersionHistoryProps = {
  note: Note;
};

export default function VersionHistory({ note }: VersionHistoryProps) {
  const { restoreVersion } = useNotes();
  const { toast } = useToast();

  const handleRestore = (versionId: string) => {
    restoreVersion(note.id, versionId);
    toast({
      title: "Version Restored",
      description: "The note has been updated to the selected version.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            Browse and restore previous versions of your note.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 -mr-6 mt-4 pr-6">
          <div className="space-y-4">
            {note.versions.length > 0 ? (
              note.versions.map((version) => (
                <div key={version.id} className="p-4 border rounded-lg bg-secondary/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">
                      {format(new Date(version.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRestore(version.id)}
                      className="text-accent-foreground bg-accent/80 hover:bg-accent"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 bg-background p-2 rounded">
                    {version.content || 'Empty content'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                No previous versions found.
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
