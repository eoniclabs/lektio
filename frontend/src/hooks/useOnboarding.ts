import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import type { StudentProfile } from "../types";

const PROFILE_KEY = "lektio_profile_id";

export function useOnboarding() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // StrictMode double-invoke guard
    if (hasChecked.current) return;
    hasChecked.current = true;

    const storedId = localStorage.getItem(PROFILE_KEY);
    if (!storedId) {
      setShowOnboarding(true);
      setIsReady(true);
      return;
    }

    api
      .get<StudentProfile>(`/profiles/${storedId}`)
      .then(() => {
        setProfileId(storedId);
        setIsReady(true);
      })
      .catch(() => {
        // Profile not found – clear stale id and show onboarding
        localStorage.removeItem(PROFILE_KEY);
        setShowOnboarding(true);
        setIsReady(true);
      });
  }, []);

  const completeOnboarding = (id: string) => {
    localStorage.setItem(PROFILE_KEY, id);
    setProfileId(id);
    setShowOnboarding(false);
  };

  return { profileId, isReady, showOnboarding, completeOnboarding };
}
