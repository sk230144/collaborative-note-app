"use client";

import { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { useNotes } from '@/context/notes-provider';
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
  const isMounted = useRef(false);

  // This effect will re-sync the local state (title, content)
  // whenever the active note prop changes.
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  // This effect handles saving the note.
  useEffect(() => {
    // We use a ref to prevent saving on the initial component mount.
    // We only want to save when the user actually makes a change.
    if (isMounted.current) {
      // Create a timeout to save the note 500ms after the user stops typing.
      const timer = setTimeout(() => {
        const updates: Partial<Pick<Note, 'title' | 'content'>> = {};
        if (title !== note.title) {
          updates.title = title;
        }
        if (content !== note.content) {
          updates.content = content;
        }
        if (Object.keys(updates).length > 0) {
          updateNote(note.id, updates);
        }
      }, 500); // 500ms debounce delay

      // Cleanup function to clear the timeout if the user types again
      return () => clearTimeout(timer);
    } else {
      // On the first render, we set the ref to true.
      isMounted.current = true;
    }
  }, [title, content, note.id, note.title, note.content, updateNote]);

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
