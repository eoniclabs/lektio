import { useAuthStore } from "../stores/auth";
import type { ConceptMastery } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchConceptMasteries(profileId: string): Promise<ConceptMastery[]> {
  const res = await fetch(`${BASE_URL}/api/profiles/${profileId}/concepts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch concept masteries");
  const data: { concepts: ConceptMastery[] } = await res.json();
  return data.concepts;
}
