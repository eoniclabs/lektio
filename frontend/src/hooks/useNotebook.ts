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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId, setEntries, setLoading]);

  const save = async (content: string, title?: string, tags?: string[]) => {
    const entry = await saveToNotebook({ profileId, content, title, tags });
    addEntry(entry);
    return entry;
  };

  const remove = async (id: string) => {
    await deleteFromNotebook(id);
    removeEntry(id);
  };

  return { entries, isLoading, save, remove };
}
