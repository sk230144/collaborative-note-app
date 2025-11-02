"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Note } from '@/lib/types';

const createWelcomeNote = (): Omit<Note, 'id'> => ({
    title: 'Welcome to CollabNote!',
    content: 'This is your first note. Start editing here!\n\nFeatures:\n- Create, edit, and delete notes.\n- Your notes are saved automatically.\n- Click the "History" button to view and restore previous versions.',
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
  isLoading: boolean;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        const welcomeNote = createWelcomeNote();
        const firstNote = { ...welcomeNote, id: crypto.randomUUID() };
        setNotes([firstNote]);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      const welcomeNote = createWelcomeNote();
      const firstNote = { ...welcomeNote, id: crypto.randomUUID() };
      setNotes([firstNote]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes, isLoading]);

  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    } else if (notes.length === 0) {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId]);

  const addNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => {
      const newNotes = prevNotes.filter(note => note.id !== noteId);
      if (activeNoteId === noteId) {
        setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
      }
      return newNotes;
    });
  }, [activeNoteId]);

  const updateNote = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes(prevNotes => {
      const noteToUpdate = prevNotes.find(n => n.id === noteId);
      if (!noteToUpdate) return prevNotes;

      const hasContentChanged = 'content' in updates && updates.content !== noteToUpdate.content;

      const newVersions = hasContentChanged ? [
        { id: crypto.randomUUID(), content: noteToUpdate.content, timestamp: noteToUpdate.updatedAt },
        ...noteToUpdate.versions,
      ].slice(0, 20) : noteToUpdate.versions;

      const updatedNote = {
        ...noteToUpdate,
        ...updates,
        updatedAt: Date.now(),
        versions: newVersions,
      };

      return prevNotes.map(n => n.id === noteId ? updatedNote : n).sort((a,b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  const restoreVersion = useCallback((noteId: string, versionId: string) => {
    setNotes(prevNotes => {
      const noteToUpdate = prevNotes.find((n) => n.id === noteId);
      if (!noteToUpdate) return prevNotes;
  
      const versionToRestore = noteToUpdate.versions.find((v) => v.id === versionId);
      if (!versionToRestore) return prevNotes;
  
      const updatedNote = {
        ...noteToUpdate,
        content: versionToRestore.content,
        updatedAt: Date.now(),
      };
  
      return prevNotes.map(n => n.id === noteId ? updatedNote : n).sort((a,b) => b.updatedAt - a.updatedAt);
    });
  }, []);
  
  const activeNote = notes.find(note => note.id === activeNoteId);

  const value = { 
    notes, 
    activeNote, 
    setActiveNoteId, 
    addNote, 
    deleteNote, 
    updateNote, 
    restoreVersion,
    isLoading
  };

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
