"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import type { Note } from '@/lib/types';
import { 
  useFirebase, 
  useUser, 
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { 
  initiateAnonymousSignIn 
} from '@/firebase/non-blocking-login';
import { 
  setDocumentNonBlocking,
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking
} from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const createWelcomeNote = (userId: string): Omit<Note, 'id' | 'createdAt' | 'updatedAt'> => ({
    title: 'Welcome to CollabNote!',
    content: 'This is your first note. Start editing here!\n\nFeatures:\n- Create, edit, and delete notes.\n- Your notes are saved automatically and synced in real-time.\n- Click the "History" button to view and restore previous versions.',
    versions: [],
    ownerId: userId,
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
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  // Automatically sign in users anonymously
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const notesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: notes, isLoading: isLoadingNotes } = useCollection<Note>(notesCollectionRef);

  // Set active note when notes load
  useEffect(() => {
    if (notes && notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    } else if (notes && notes.length === 0) {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId]);

  // Create a welcome note for new users
  useEffect(() => {
    if (user && firestore && notes?.length === 0) {
      const welcomeNoteData = createWelcomeNote(user.uid);
      const newNoteRef = doc(collection(firestore, 'users', user.uid, 'notes'));
      setDocumentNonBlocking(newNoteRef, {
        ...welcomeNoteData,
        id: newNoteRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }, [user, firestore, notes]);


  const addNote = useCallback(() => {
    if (!firestore || !user) return;
    const newNoteRef = doc(collection(firestore, 'users', user.uid, 'notes'));
    setDocumentNonBlocking(newNoteRef, {
      id: newNoteRef.id,
      title: 'Untitled Note',
      content: '',
      versions: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: user.uid,
    }, { merge: true });
    setActiveNoteId(newNoteRef.id);
  }, [firestore, user]);

  const deleteNote = useCallback((noteId: string) => {
    if (!firestore || !user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    deleteDocumentNonBlocking(noteRef);

    if (activeNoteId === noteId) {
       const newActiveNote = notes?.find(n => n.id !== noteId);
       setActiveNoteId(newActiveNote ? newActiveNote.id : null);
    }
  }, [firestore, user, activeNoteId, notes]);

  const updateNote = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    if (!firestore || !user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    const originalNote = notes?.find(n => n.id === noteId);

    if (!originalNote) return;

    const hasContentChanged = 'content' in updates && updates.content !== originalNote.content;

    const newVersions = hasContentChanged ? [
      { id: crypto.randomUUID(), content: originalNote.content, timestamp: originalNote.updatedAt },
      ...originalNote.versions,
    ].slice(0, 20) : originalNote.versions;

    const dataToUpdate: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (hasContentChanged) {
      dataToUpdate.versions = newVersions;
    }

    updateDocumentNonBlocking(noteRef, dataToUpdate);
  }, [firestore, user, notes]);

  const restoreVersion = useCallback((noteId: string, versionId: string) => {
    if (!firestore || !user) return;

    const note = notes?.find((n) => n.id === noteId);
    if (!note) return;

    const version = note.versions.find((v) => v.id === versionId);
    if (!version) return;

    updateNote(noteId, { content: version.content });
  }, [firestore, user, notes, updateNote]);
  
  const activeNote = useMemo(() => notes?.find(note => note.id === activeNoteId), [notes, activeNoteId]);

  const value = { 
    notes: notes || [], 
    activeNote, 
    setActiveNoteId, 
    addNote, 
    deleteNote, 
    updateNote, 
    restoreVersion,
    isLoading: isUserLoading || isLoadingNotes,
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
