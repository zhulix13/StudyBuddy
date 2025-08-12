import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note } from "@/types/notes";

type modeType = null | "view" | "edit" | "create";

interface NoteStore {
  notes: Note[];
  selectedNote: Note | null;
  editingNote: Note | null;
  mode: modeType;
  setMode: (mode: modeType) => void;
  setNotes: (notes: Note[]) => void;
  setSelectedNote: (note: Note | null) => void;
  setEditingNote: (note: Note | null) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      selectedNote: null,
      editingNote: null,
      mode: null,
      setNotes: (notes: Note[]) => set({ notes }),
      setSelectedNote: (note: Note | null) => set({ selectedNote: note }),
      setEditingNote: (note: Note | null) => set({ editingNote: note }),
      setMode: (mode: modeType) => set({ mode }),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        notes: state.notes,
        selectedNote: state.selectedNote,
        editingNote: state.editingNote,
        mode: state.mode,
      }),
    }
  )
);
