const EXAMPLE_PROMPTS = [
  "Vad är derivatan av en funktion?",
  "Förklara fotosyntesen som en berättelse",
  "Hur fungerar en for-loop i programmering?",
];

interface EmptyStateProps {
  onPrompt: (text: string) => void;
}

export function EmptyState({ onPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#2B9DB0] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-[#2B9DB0]/20">
        L
      </div>
      <h2 className="text-xl font-bold text-gray-800">Hej! Jag är Lektio.</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Ställ en fråga eller fota en sida ur din lärobok.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#2B9DB0] hover:text-[#2B9DB0] hover:bg-[#2B9DB0]/5 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
