import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepDots } from "./StepDots";
import { api } from "../../services/api";
import type { SchoolLevel, StudentProfile } from "../../types";

interface OnboardingModalProps {
  onComplete: (profileId: string) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(null);
  const [explanationStyle, setExplanationStyle] = useState<
    "visual_first" | "detailed" | "concise"
  >("visual_first");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const animateToStep = (nextStep: number) => {
    if (!containerRef.current) {
      setStep(nextStep);
      return;
    }
    gsap.to(containerRef.current, {
      x: -20,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        setStep(nextStep);
        gsap.fromTo(
          containerRef.current,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25 },
        );
      },
    });
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }, []);

  const handleNext = () => {
    if (!name.trim() || schoolLevel === null) return;
    animateToStep(1);
  };

  const handleSubmit = async () => {
    if (!schoolLevel) return;
    setIsLoading(true);
    setError(null);
    try {
      const profile = await api.post<StudentProfile>("/profiles", {
        name: name.trim(),
        schoolLevel,
        preferences: { explanationStyle, voiceEnabled },
        conceptMastery: {},
        streakDays: 0,
      });
      onComplete(profile.id);
    } catch {
      setError("Kunde inte spara profilen. Försök igen.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2B9DB0] to-[#1d7a8a] p-6 text-white">
          <h1 className="text-2xl font-bold">Välkommen till Lektio!</h1>
          <p className="text-teal-100 text-sm mt-1">Din AI-studiekompis</p>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <StepDots total={2} current={step} />
          </div>

          <div ref={containerRef}>
            {step === 0 ? (
              <StepOne
                name={name}
                schoolLevel={schoolLevel}
                onNameChange={setName}
                onLevelChange={setSchoolLevel}
                onNext={handleNext}
              />
            ) : (
              <StepTwo
                explanationStyle={explanationStyle}
                voiceEnabled={voiceEnabled}
                onStyleChange={setExplanationStyle}
                onVoiceChange={setVoiceEnabled}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
