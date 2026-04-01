import { useCallback, useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { useChatStore } from "../stores/chat";
import { api } from "../services/api";
import type { AuthResponse, StudentPreferences } from "../types";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  schoolLevel: string;
  preferences: StudentPreferences;
}

export function useAuth() {
  const { token, profileId, name, setAuth, logout: storeLogout } = useAuthStore();

  const isAuthenticated = useMemo(() => token !== null, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    setAuth(res.token, res.profileId, res.name);
  }, [setAuth]);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<AuthResponse>("/auth/register", data);
    setAuth(res.token, res.profileId, res.name);
  }, [setAuth]);

  const logout = useCallback(() => {
    storeLogout();
    useChatStore.getState().clearMessages();
  }, [storeLogout]);

  return { isAuthenticated, token, profileId, name, login, register, logout };
}
