import {create} from "zustand";
import {persist} from "zustand/middleware";


import type {Note} from "@/types/notes";

type modeType = null |"view" | "edit" | "create";
interface NoteStore {
  notes: Note[];
  mode: modeType;
  setMode: (mode: modeType) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      mode: null,
      setNotes: (notes: Note[]) => set({notes}),
      setMode: (mode: modeType) => set({mode}),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        notes: state.notes,
        mode: state.mode,
      }),
    }
  )
);
