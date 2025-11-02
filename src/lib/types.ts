import type { Timestamp } from 'firebase/firestore';

export type NoteVersion = {
  id: string;
  content: string;
  timestamp: Timestamp | number; // Firestore uses Timestamp, client might use number
};

export type Note = {
  id: string;
  title: string;
  content: string;
  versions: NoteVersion[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string;
};
