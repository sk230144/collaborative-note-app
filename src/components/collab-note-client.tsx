"use client";

import { useNotes } from '@/context/notes-provider';
import NoteList from '@/components/notes/note-list';
import NoteEditor from '@/components/notes/note-editor';
import { Card } from '@/components/ui/card';
import { AppWindow } from 'lucide-react';

export default function CollabNoteClient() {
  const { activeNote } = useNotes();

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
