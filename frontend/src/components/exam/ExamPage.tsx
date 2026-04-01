import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useExam } from "../../hooks/useExam";
import { ExamTopicForm } from "./ExamTopicForm";
import { ExamQuiz } from "./ExamQuiz";
import { ExamResults } from "./ExamResults";

interface ExamPageProps {
  profileId: string;
  onClose: () => void;
}

export function ExamPage({ profileId, onClose }: ExamPageProps) {
  const { isGenerating, exam, result, error, generate, submit, reset } = useExam(profileId);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="Tillbaka"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-bold text-lg text-[#2B9DB0]">Examensprov</span>

        <div className="w-8" />
      </header>

      {/* Content */}
      {result !== null ? (
        <ExamResults result={result} onReset={reset} />
      ) : exam !== null ? (
        <ExamQuiz exam={exam} onSubmit={submit} />
      ) : (
        <ExamTopicForm isGenerating={isGenerating} error={error} onGenerate={generate} />
      )}
    </div>
  );
}
