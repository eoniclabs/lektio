import { useAuthStore } from "../stores/auth";
import type { Exam, ExamResult } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function generateExam(
  profileId: string,
  topic: string,
  questionCount = 5,
): Promise<Exam> {
  const res = await fetch(`${BASE_URL}/api/exams/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ profileId, topic, questionCount }),
  });
  if (!res.ok) throw new Error("Failed to generate exam");
  return res.json();
}

export async function submitExam(
  examId: string,
  profileId: string,
  answers: number[],
): Promise<ExamResult & { exam: Exam }> {
  const res = await fetch(`${BASE_URL}/api/exams/${examId}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ profileId, answers }),
  });
  if (!res.ok) throw new Error("Failed to submit exam");
  return res.json();
}

export async function fetchExams(profileId: string): Promise<Exam[]> {
  const res = await fetch(`${BASE_URL}/api/profiles/${profileId}/exams`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch exams");
  return res.json();
}
