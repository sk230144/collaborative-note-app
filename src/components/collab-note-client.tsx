"use client";

import { useNotes } from '@/context/notes-provider';
import NoteList from '@/components/notes/note-list';
import NoteEditor from '@/components/notes/note-editor';
import { Card } from '@/components/ui/card';
import { AppWindow } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollabNoteClient() {
  const { activeNote, isLoading } = useNotes();

  if (isLoading) {
    return (
      <main className="h-screen w-screen flex flex-col">
        <header className="flex items-center gap-2 p-4 border-b bg-card">
          <AppWindow className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">CollabNote</h1>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-full max-w-xs border-r bg-card/80 backdrop-blur-sm flex flex-col p-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </aside>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
             <div className="flex items-center justify-center h-full">
              <Card className="p-8 text-center text-muted-foreground bg-background border-dashed">
                <p className="font-medium">Loading notes...</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col">
      <header className="flex items-center gap-2 p-4 border-b bg-card">
        <AppWindow className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">CollabNote</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <NoteList />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeNote ? (
            <NoteEditor note={activeNote} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="p-8 text-center text-muted-foreground bg-background border-dashed">
                <p className="font-medium">Select a note to start editing</p>
                <p className="text-sm">or create a new one.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
