import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { Exam, ExamResult } from "../../types";

interface ExamResultsProps {
  result: ExamResult & { exam: Exam };
  onReset: () => void;
}

export function ExamResults({ result, onReset }: ExamResultsProps) {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const percentage = Math.round((result.score / result.total) * 100);

  const scoreColor =
    percentage >= 70 ? "text-green-500" : percentage >= 50 ? "text-orange-400" : "text-red-500";

  useLayoutEffect(() => {
    const counter = { val: 0 };
    gsap.to(counter, {
      val: result.score,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (scoreRef.current) {
          scoreRef.current.textContent = String(Math.round(counter.val));
        }
      },
    });

    const pct = { val: 0 };
    gsap.to(pct, {
      val: percentage,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (percentageRef.current) {
          percentageRef.current.textContent = `${Math.round(pct.val)}%`;
        }
      },
    });
  }, [result.score, percentage]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Score header */}
      <div className="flex flex-col items-center py-8 px-6 flex-shrink-0">
        <div className={`text-6xl font-bold ${scoreColor} mb-1`}>
          <span ref={percentageRef}>0%</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          <span ref={scoreRef}>0</span> / {result.total} rätt
        </p>
        <p className="text-gray-400 text-xs mt-2">{result.exam.topic}</p>
      </div>

      {/* Question review */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {result.exam.questions.map((q, i) => {
            const isCorrect = result.answers[i] === q.correctIndex;
            const userAnswer = result.answers[i];

            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-base flex-shrink-0">{isCorrect ? "✅" : "❌"}</span>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{q.question}</p>
                </div>

                {!isCorrect && (
                  <p className="text-xs text-red-600 ml-6 mb-1">
                    Ditt svar: {q.options[userAnswer]}
                  </p>
                )}
                <p className="text-xs text-green-700 ml-6 mb-2">
                  Rätt svar: {q.options[q.correctIndex]}
                </p>
                <p className="text-xs text-gray-600 ml-6 italic">{q.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl bg-[#2B9DB0] text-white text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Nytt prov
        </button>
      </div>
    </div>
  );
}
