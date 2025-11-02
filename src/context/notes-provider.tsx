"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Note } from '@/lib/types';

const NOTES_STORAGE_KEY = 'collab-notes';

const createWelcomeNote = (): Note => ({
    id: crypto.randomUUID(),
    title: 'Welcome to CollabNote!',
    content: 'This is your first note. Start editing here!\n\nFeatures:\n- Create, edit, and delete notes.\n- Your notes are saved automatically after you stop typing.\n- Changes are synced across tabs in real-time.\n- Click the "History" button to view and restore previous versions of this note.',
    versions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
});

type NotesContextType = {
  notes: Note[];
  activeNote: Note | undefined;
  setActiveNoteId: (id: string | null) => void;
  addNote: () => void;
  deleteNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  restoreVersion: (noteId: string, versionId: string) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(NOTES_STORAGE_KEY);
      if (item) {
        const parsedNotes = JSON.parse(item);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0 && !activeNoteId) {
          setActiveNoteId(parsedNotes[0].id);
        }
      } else {
        const welcomeNote = createWelcomeNote();
        setNotes([welcomeNote]);
        setActiveNoteId(welcomeNote.id);
        window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([welcomeNote]));
      }
    } catch (error) {
      console.error('Error initializing notes from localStorage', error);
      const welcomeNote = createWelcomeNote();
      setNotes([welcomeNote]);
      setActiveNoteId(welcomeNote.id);
    }
  }, [activeNoteId]);

  const saveNotes = useCallback((newNotes: Note[]) => {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes to localStorage', error);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === NOTES_STORAGE_KEY && event.newValue) {
        try {
          const newNotes = JSON.parse(event.newValue);
          setNotes(newNotes);
        } catch (error) {
          console.error('Error parsing notes from storage event', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newNotes = [newNote, ...notes];
    saveNotes(newNotes);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (noteId: string) => {
    const newNotes = notes.filter((note) => note.id !== noteId);
    saveNotes(newNotes);
    if (activeNoteId === noteId) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
  };

  const updateNote = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    const newNotes = notes.map((note) => {
      if (note.id === noteId) {
        const noteToUpdate = note;
        const hasContentChanged = 'content' in updates && updates.content !== noteToUpdate.content;
        
        const newVersions = hasContentChanged ? [
          { id: crypto.randomUUID(), content: noteToUpdate.content, timestamp: noteToUpdate.updatedAt },
          ...noteToUpdate.versions,
        ].slice(0, 20) : noteToUpdate.versions;

        return {
          ...noteToUpdate,
          ...updates,
          updatedAt: Date.now(),
          ...(hasContentChanged && { versions: newVersions }),
        };
      }
      return note;
    });
    saveNotes(newNotes);
  }, [notes, saveNotes]);

  const restoreVersion = (noteId: string, versionId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const version = note.versions.find((v) => v.id === versionId);
    if (!version) return;

    updateNote(noteId, { content: version.content });
  };
  
  const activeNote = notes.find(note => note.id === activeNoteId);

  const value = { notes, activeNote, setActiveNoteId, addNote, deleteNote, updateNote, restoreVersion };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
