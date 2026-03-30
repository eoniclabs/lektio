import { useState } from "react";
import type { Exam, ExamResult } from "../types";
import { generateExam, submitExam } from "../services/exam";

export function useExam(profileId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<(ExamResult & { exam: Exam }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (topic: string, questionCount = 5) => {
    setIsGenerating(true);
    setError(null);
    try {
      const generated = await generateExam(profileId, topic, questionCount);
      setExam(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel vid generering av prov");
    } finally {
      setIsGenerating(false);
    }
  };

  const submit = async (answers: number[]) => {
    if (!exam) return;
    setError(null);
    try {
      const examResult = await submitExam(exam.id, profileId, answers);
      setResult(examResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel vid inlämning");
    }
  };

  const reset = () => {
    setExam(null);
    setResult(null);
    setError(null);
  };

  return { isGenerating, exam, result, error, generate, submit, reset };
}
