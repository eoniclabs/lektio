import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  profileId: string | null;
  name: string | null;
  setAuth: (token: string, profileId: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      profileId: null,
      name: null,
      setAuth: (token, profileId, name) => set({ token, profileId, name }),
      logout: () => set({ token: null, profileId: null, name: null }),
    }),
    { name: "lektio-auth" },
  ),
);
