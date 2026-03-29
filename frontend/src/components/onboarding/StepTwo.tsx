interface StepTwoProps {
  explanationStyle: "visual_first" | "detailed" | "concise";
  voiceEnabled: boolean;
  onStyleChange: (style: "visual_first" | "detailed" | "concise") => void;
  onVoiceChange: (enabled: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const styles: {
  value: "visual_first" | "detailed" | "concise";
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "visual_first",
    label: "Visuellt",
    description: "Metaforer & bilder först",
    emoji: "🎨",
  },
  {
    value: "detailed",
    label: "Detaljerat",
    description: "Steg för steg",
    emoji: "📝",
  },
  {
    value: "concise",
    label: "Kortfattat",
    description: "Rakt på sak",
    emoji: "⚡",
  },
];

export function StepTwo({
  explanationStyle,
  voiceEnabled,
  onStyleChange,
  onVoiceChange,
  onSubmit,
  isLoading,
}: StepTwoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Hur vill du att jag förklarar?
        </label>
        <div className="flex flex-col gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              onClick={() => onStyleChange(s.value)}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 ${
                explanationStyle === s.value
                  ? "border-[#2B9DB0] bg-[#2B9DB0]/5"
                  : "border-gray-200 bg-white hover:border-[#2B9DB0]/40"
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <div className="font-medium text-sm text-gray-800">{s.label}</div>
                <div className="text-xs text-gray-500">{s.description}</div>
              </div>
              {explanationStyle === s.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-[#2B9DB0] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
        <div>
          <div className="font-medium text-sm text-gray-800">Röstförklaringar</div>
          <div className="text-xs text-gray-500">AI läser upp svaren högt</div>
        </div>
        <button
          onClick={() => onVoiceChange(!voiceEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            voiceEnabled ? "bg-[#2B9DB0]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              voiceEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-[#2B9DB0] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2490a3] transition-colors"
      >
        {isLoading ? "Skapar din profil..." : "Börja plugga! 🚀"}
      </button>
    </div>
  );
}
