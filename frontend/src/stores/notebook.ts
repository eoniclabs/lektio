import { create } from "zustand";
import type { NotebookEntry } from "../types";

interface NotebookStore {
  entries: NotebookEntry[];
  isLoading: boolean;
  setEntries: (entries: NotebookEntry[]) => void;
  addEntry: (entry: NotebookEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (v: boolean) => void;
}

export const useNotebookStore = create<NotebookStore>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
}));
