import { useCallback, useEffect, useRef, useState } from "react";
import type { ConceptMastery } from "../types";
import { fetchConceptMasteries } from "../services/concepts";

export function useConceptMastery(profileId: string) {
  const [concepts, setConcepts] = useState<ConceptMastery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const serviceRef = useRef({ fetch: fetchConceptMasteries });

  const load = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      const data = await serviceRef.current.fetch(profileId);
      setConcepts(data);
    } catch (err) {
      console.error("Failed to load concept masteries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  return { concepts, isLoading, reload: load };
}
