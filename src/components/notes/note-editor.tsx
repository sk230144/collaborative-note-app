"use client";

import { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { useNotes } from '@/context/notes-provider';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VersionHistory from './version-history';
import { formatDistanceToNow } from 'date-fns';

type NoteEditorProps = {
  note: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { updateNote } = useNotes();
  const noteIdRef = useRef(note.id);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  useEffect(() => {
    noteIdRef.current = note.id;
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    // Only update if the debounced value is different from the note's current state
    if (debouncedTitle !== note.title) {
      updateNote(noteIdRef.current, { title: debouncedTitle });
    }
  }, [debouncedTitle, note.title, updateNote]);

  useEffect(() => {
    // Only update if the debounced value is different from the note's current state
    if (debouncedContent !== note.content) {
      updateNote(noteIdRef.current, { content: debouncedContent });
    }
  }, [debouncedContent, note.content, updateNote]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-2xl font-bold border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent"
        />
        <VersionHistory note={note} />
      </div>
      <div className="flex-1 flex flex-col">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 w-full text-base resize-none border-0 shadow-none p-0 focus-visible:ring-0 bg-transparent"
        />
      </div>
       <div className="text-xs text-muted-foreground mt-4 text-right">
        Last updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
      </div>
    </div>
  );
}
