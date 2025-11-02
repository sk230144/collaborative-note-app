"use client";

import { useNotes } from '@/context/notes-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

export default function NoteList() {
  const { notes, activeNote, setActiveNoteId, addNote, deleteNote } = useNotes();

  return (
    <aside className="w-full max-w-xs border-r bg-card/80 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={addNote} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notes.length > 0 ? notes.map(note => (
            <Card
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                "cursor-pointer group hover:bg-secondary/50 transition-colors",
                activeNote?.id === note.id && "bg-secondary"
              )}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold truncate">{note.title || 'Untitled Note'}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {note.content.split('\n')[0] || 'No content'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              No notes yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
