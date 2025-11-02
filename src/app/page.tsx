import { NotesProvider } from '@/context/notes-provider';
import CollabNoteClient from '@/components/collab-note-client';

export default function Home() {
  return (
    <NotesProvider>
      <CollabNoteClient />
    </NotesProvider>
  );
}
