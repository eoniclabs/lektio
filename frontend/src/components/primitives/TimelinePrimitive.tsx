import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAnimation } from "../../contexts/AnimationContext";

export function TimelinePrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[currentStep];
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [currentStep]);

  const visibleSteps = primitive.steps.slice(0, currentStep + 1);

  return (
    <div className="py-3 px-1">
      <div className="relative">
        {/* Vertical spine */}
        <div
          className="absolute left-[22px] top-3 w-0.5 bg-[#2B9DB0]/20 transition-all duration-500"
          style={{ height: `${Math.max(0, visibleSteps.length - 1) * 72}px` }}
        />

        <div className="flex flex-col gap-4">
          {primitive.steps.map((step, i) => {
            const data = step.data as {
              year?: string | number;
              label?: string;
              description?: string;
            };
            const isVisible = i <= currentStep;
            const isCurrent = i === currentStep;
            const year = data.year ?? "";
            const label = data.label ?? step.narration;
            const description = data.description;

            return (
              <div
                key={i}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`flex items-start gap-3 transition-opacity duration-150 ${
                  isVisible ? "" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Dot */}
                <div className="flex-shrink-0 flex flex-col items-center pt-1">
                  <div
                    className={`w-[18px] h-[18px] rounded-full border-2 transition-all duration-300 ${
                      isCurrent
                        ? "border-[#2B9DB0] bg-[#2B9DB0]"
                        : "border-[#2B9DB0] bg-white"
                    }`}
                  >
                    {!isCurrent && i < currentStep && (
                      <div className="w-full h-full rounded-full bg-[#2B9DB0]/40" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  {year && (
                    <span className="inline-block text-xs font-bold text-[#2B9DB0] bg-[#2B9DB0]/10 rounded-full px-2 py-0.5 mb-1">
                      {year}
                    </span>
                  )}
                  <p className={`text-sm font-semibold leading-snug ${isCurrent ? "text-gray-800" : "text-gray-500"}`}>
                    {label}
                  </p>
                  {description && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
