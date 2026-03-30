import { useState } from "react";
import type { Exam } from "../../types";

interface ExamQuizProps {
  exam: Exam;
  onSubmit: (answers: number[]) => void;
}

export function ExamQuiz({ exam, onSubmit }: ExamQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(exam.questions.length).fill(null),
  );

  const question = exam.questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isLast = currentIndex === exam.questions.length - 1;

  const handleSelect = (optionIndex: number) => {
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit(answers.map((a) => a ?? 0));
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Progress */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Fråga {currentIndex + 1} av {exam.questions.length}
          </span>
          <span className="text-sm text-gray-400">{exam.topic}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2B9DB0] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exam.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <p className="text-base font-semibold text-gray-800 mb-6 leading-relaxed">
          {question.question}
        </p>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                selectedAnswer === i
                  ? "bg-[#2B9DB0] border-[#2B9DB0] text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#2B9DB0] hover:bg-teal-50"
              }`}
            >
              <span className="font-bold mr-2">{optionLabels[i]})</span>
              {option.replace(/^[A-D]\)\s*/, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Föregående
        </button>
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="flex-1 py-3 rounded-xl bg-[#2B9DB0] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isLast ? "Lämna in" : "Nästa"}
        </button>
      </div>
    </div>
  );
}
