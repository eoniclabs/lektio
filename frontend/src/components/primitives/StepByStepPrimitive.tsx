import { useEffect, useRef } from "react";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import { useAnimation } from "../../contexts/AnimationContext";

export function StepByStepPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Animate the newly revealed step
  useEffect(() => {
    const el = itemRefs.current[currentStep];
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-1 py-2">
      <ol className="flex flex-col gap-2">
        {primitive.steps.map((step, i) => {
          const data = step.data as { text?: string; stepNumber?: number };
          const isVisible = i <= currentStep;
          const isCurrent = i === currentStep;
          const label = data.stepNumber ?? i + 1;
          const text = data.text ?? step.narration;

          return (
            <li
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={`flex items-start gap-3 transition-opacity duration-200 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Step number badge */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                  isCurrent
                    ? "bg-[#2B9DB0] text-white shadow-sm shadow-[#2B9DB0]/30"
                    : i < currentStep
                    ? "bg-[#2B9DB0]/15 text-[#2B9DB0]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  label
                )}
              </div>

              {/* Step text */}
              <div
                className={`flex-1 text-sm leading-relaxed pt-0.5 prose prose-sm max-w-none ${
                  isCurrent ? "text-gray-800" : i < currentStep ? "text-gray-500" : "text-gray-300"
                }`}
              >
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2B9DB0] rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / primitive.steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
