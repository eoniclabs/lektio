import type { NotebookEntry, ProfileStats } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function fetchNotebook(profileId: string): Promise<NotebookEntry[]> {
  const res = await fetch(`${BASE_URL}/api/notebook/${profileId}`);
  if (!res.ok) throw new Error("Failed to fetch notebook");
  return res.json();
}

export async function saveToNotebook(entry: {
  profileId: string;
  content: string;
  title?: string;
  tags?: string[];
}): Promise<NotebookEntry> {
  const res = await fetch(`${BASE_URL}/api/notebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to save to notebook");
  return res.json();
}

export async function deleteFromNotebook(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notebook/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notebook entry");
}

export async function fetchProfileStats(profileId: string): Promise<ProfileStats> {
  const res = await fetch(`${BASE_URL}/api/profiles/${profileId}/stats`);
  if (!res.ok) throw new Error("Failed to fetch profile stats");
  return res.json();
}
