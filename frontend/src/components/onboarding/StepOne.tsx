import type { SchoolLevel } from "../../types";

interface StepOneProps {
  name: string;
  schoolLevel: SchoolLevel | null;
  onNameChange: (name: string) => void;
  onLevelChange: (level: SchoolLevel) => void;
  onNext: () => void;
}

const levels: { value: SchoolLevel; label: string; description: string }[] = [
  { value: "mellanstadiet", label: "Mellanstadiet", description: "Åk 4–6" },
  { value: "hogstadiet", label: "Högstadiet", description: "Åk 7–9" },
  { value: "gymnasiet", label: "Gymnasiet", description: "Åk 1–3" },
  { value: "hogskola", label: "Högskola", description: "Universitet" },
];

export function StepOne({ name, schoolLevel, onNameChange, onLevelChange, onNext }: StepOneProps) {
  const canProceed = name.trim().length > 0 && schoolLevel !== null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Vad heter du?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ditt namn"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9DB0] focus:border-transparent text-gray-800 placeholder-gray-400"
          onKeyDown={(e) => e.key === "Enter" && canProceed && onNext()}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Vilken nivå studerar du på?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onLevelChange(level.value)}
              className={`py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 ${
                schoolLevel === level.value
                  ? "border-[#2B9DB0] bg-[#2B9DB0] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#2B9DB0]"
              }`}
            >
              <div className="font-medium text-sm">{level.label}</div>
              <div className={`text-xs mt-0.5 ${schoolLevel === level.value ? "text-teal-100" : "text-gray-400"}`}>
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3.5 rounded-xl bg-[#2B9DB0] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2490a3] transition-colors"
      >
        Nästa →
      </button>
    </div>
  );
}
