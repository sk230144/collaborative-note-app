
export type NoteVersion = {
  id: string;
  content: string;
  timestamp: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  versions: NoteVersion[];
  createdAt: number;
  updatedAt: number;
};
