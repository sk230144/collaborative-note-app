"use client";

import { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { useNotes } from '@/context/notes-provider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VersionHistory from './version-history';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '@/hooks/use-debounce';
import type { Timestamp } from 'firebase/firestore';

type NoteEditorProps = {
  note: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { updateNote } = useNotes();
  const isMounted = useRef(false);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  // This effect will re-sync the local state (title, content)
  // whenever the active note prop changes. This is the key fix.
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    // Reset the mounted flag to prevent auto-saving on first load of a new note
    isMounted.current = false;
  }, [note.id, note.title, note.content]);

  // This effect handles saving the debounced changes.
  useEffect(() => {
    // We use isMounted to prevent the effect from running on the initial render
    // of a new note, which could cause a race condition. It now only saves
    // after the component has mounted AND the user has actually made a change.
    if (isMounted.current) {
      const updates: Partial<Pick<Note, 'title' | 'content'>> = {};
      let needsUpdate = false;

      // Check against the prop from context, not a stale value.
      if (debouncedTitle !== note.title) {
        updates.title = debouncedTitle;
        needsUpdate = true;
      }
      if (debouncedContent !== note.content) {
        updates.content = debouncedContent;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateNote(note.id, updates);
      }
    } else {
      // After the first render (or after a note switch), we set isMounted to true.
      isMounted.current = true;
    }
  }, [debouncedTitle, debouncedContent, note.id, note.title, note.content, updateNote]);

  const getUpdatedAtTimestamp = (timestamp: Timestamp | number): Date => {
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  };

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
        Last updated {formatDistanceToNow(getUpdatedAtTimestamp(note.updatedAt), { addSuffix: true })}
      </div>
    </div>
  );
}
