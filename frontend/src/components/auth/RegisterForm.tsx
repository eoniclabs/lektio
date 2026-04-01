import { useState } from "react";
import type { SchoolLevel, StudentPreferences } from "../../types";

interface RegisterFormProps {
  onRegister: (data: {
    email: string;
    password: string;
    name: string;
    schoolLevel: string;
    preferences: StudentPreferences;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
}

const SCHOOL_LEVELS: { value: SchoolLevel; label: string }[] = [
  { value: "mellanstadiet", label: "Mellanstadiet" },
  { value: "hogstadiet", label: "Högstadiet" },
  { value: "gymnasiet", label: "Gymnasiet" },
  { value: "hogskola", label: "Högskola" },
];

const EXPLANATION_STYLES: {
  value: StudentPreferences["explanationStyle"];
  label: string;
  description: string;
}[] = [
  {
    value: "visual_first",
    label: "Visuellt",
    description: "Bilder och animationer först",
  },
  { value: "detailed", label: "Detaljerat", description: "Grundliga förklaringar" },
  { value: "concise", label: "Kortfattat", description: "Snabba svar" },
];

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>("hogstadiet");
  const [explanationStyle, setExplanationStyle] =
    useState<StudentPreferences["explanationStyle"]>("visual_first");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!email || !password || !name) {
        setError("Alla fält krävs");
        return;
      }
      if (password.length < 6) {
        setError("Lösenord måste vara minst 6 tecken");
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onRegister({
        email,
        password,
        name,
        schoolLevel,
        preferences: { explanationStyle, voiceEnabled },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("409")
            ? "E-postadressen används redan"
            : err.message
          : "Något gick fel",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Skapa konto</h2>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-[#2B9DB0]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-name" className="text-sm font-medium text-gray-700">
              Namn
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#2B9DB0] focus:ring-1 focus:ring-[#2B9DB0] focus:outline-none"
              placeholder="Ditt namn"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-email" className="text-sm font-medium text-gray-700">
              E-post
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#2B9DB0] focus:ring-1 focus:ring-[#2B9DB0] focus:outline-none"
              placeholder="din@email.se"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
              Lösenord
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#2B9DB0] focus:ring-1 focus:ring-[#2B9DB0] focus:outline-none"
              placeholder="Minst 6 tecken"
            />
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="mt-2 rounded-lg bg-[#2B9DB0] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#248a9b]"
          >
            Nästa
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-sm text-gray-600">Vilken nivå studerar du på?</p>
          <div className="flex flex-col gap-2">
            {SCHOOL_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setSchoolLevel(level.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  schoolLevel === level.value
                    ? "border-[#2B9DB0] bg-[#2B9DB0]/10 text-[#2B9DB0]"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Tillbaka
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 rounded-lg bg-[#2B9DB0] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#248a9b]"
            >
              Nästa
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-sm text-gray-600">Hur vill du ha förklaringar?</p>
          <div className="flex flex-col gap-2">
            {EXPLANATION_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setExplanationStyle(style.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  explanationStyle === style.value
                    ? "border-[#2B9DB0] bg-[#2B9DB0]/10 text-[#2B9DB0]"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="font-medium">{style.label}</span>
                <span className="ml-2 text-sm text-gray-500">
                  — {style.description}
                </span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#2B9DB0] focus:ring-[#2B9DB0]"
            />
            <div>
              <span className="font-medium text-gray-700">Röstuppläsning</span>
              <p className="text-sm text-gray-500">Låt AI:n läsa upp förklaringar</p>
            </div>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Tillbaka
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-[#2B9DB0] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#248a9b] disabled:opacity-50"
            >
              {loading ? "Registrerar..." : "Registrera"}
            </button>
          </div>
        </>
      )}

      <p className="text-center text-sm text-gray-500">
        Har du redan ett konto?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-[#2B9DB0] hover:underline"
        >
          Logga in
        </button>
      </p>
    </form>
  );
}
