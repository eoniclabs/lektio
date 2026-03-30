import { useEffect, useRef } from "react";
import { useNotebookStore } from "../stores/notebook";
import {
  fetchNotebook,
  saveToNotebook,
  deleteFromNotebook,
} from "../services/notebook";

export function useNotebook(profileId: string) {
  const { entries, isLoading, setEntries, addEntry, removeEntry, setLoading } =
    useNotebookStore();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!profileId || loadedRef.current) return;
    loadedRef.current = true;

    setLoading(true);
    fetchNotebook(profileId)
      .then(setEntries)
      .catch((err) => console.error("Failed to fetch notebook:", err))
      .finally(() => setLoading(false));
  }, [profileId, setEntries, setLoading]);

  const save = async (content: string, title?: string, tags?: string[]) => {
    try {
      const entry = await saveToNotebook({ profileId, content, title, tags });
      addEntry(entry);
      return entry;
    } catch (err) {
      console.error("Failed to save notebook entry:", err);
      return null;
    }
  };

  const remove = async (id: string) => {
    // Optimistic remove
    const snapshot = [...entries];
    removeEntry(id);
    try {
      await deleteFromNotebook(id, profileId);
    } catch (err) {
      console.error("Failed to delete notebook entry:", err);
      // Roll back
      setEntries(snapshot);
    }
  };

  return { entries, isLoading, save, remove };
}
