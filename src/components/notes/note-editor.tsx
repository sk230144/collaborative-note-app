"use client";

import { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { useNotes } from '@/context/notes-provider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VersionHistory from './version-history';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '@/hooks/use-debounce';

type NoteEditorProps = {
  note: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { updateNote } = useNotes();
  const isMounted = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Effect to reset state when the note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    isMounted.current = false; // Prevent auto-saving on first load of a new note
    
    // Clear any pending debounced save from the previous note
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  }, [note.id, note.title, note.content]);

  // Effect to handle debounced saving
  useEffect(() => {
    // Only save after the initial render and when changes are made
    if (isMounted.current) {
       if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        const updates: Partial<Pick<Note, 'title' | 'content'>> = {};
        let needsUpdate = false;

        if (title !== note.title) {
          updates.title = title;
          needsUpdate = true;
        }
        if (content !== note.content) {
          updates.content = content;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateNote(note.id, updates);
        }
      }, 500);
    } else {
      isMounted.current = true;
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [title, content, note.id, note.title, note.content, updateNote]);

  const getUpdatedAtTimestamp = (timestamp: number): Date => {
    return new Date(timestamp);
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
