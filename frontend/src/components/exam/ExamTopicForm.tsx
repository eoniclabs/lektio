import { useState } from "react";

interface ExamTopicFormProps {
  isGenerating: boolean;
  error: string | null;
  onGenerate: (topic: string, questionCount: number) => void;
}

const QUESTION_COUNTS = [5, 10, 15];

export function ExamTopicForm({ isGenerating, error, onGenerate }: ExamTopicFormProps) {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate(topic.trim(), questionCount);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      <div className="text-4xl mb-6">📝</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Skapa prov</h2>
      <p className="text-gray-500 text-sm mb-8 text-center">
        Ange ett ämne och välj antal frågor
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Vilket ämne vill du bli testad på?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="t.ex. fotosyntesen, andra världskriget..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B9DB0] focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Antal frågor</label>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  questionCount === count
                    ? "bg-[#2B9DB0] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                disabled={isGenerating}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!topic.trim() || isGenerating}
          className="w-full py-3 rounded-xl bg-[#2B9DB0] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Genererar prov...
            </>
          ) : (
            "Generera prov"
          )}
        </button>
      </form>
    </div>
  );
}
