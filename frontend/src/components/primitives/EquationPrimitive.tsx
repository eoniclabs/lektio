import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import gsap from "gsap";
import { useAnimation } from "../../contexts/AnimationContext";

export function EquationPrimitive() {
  const { state } = useAnimation();
  const { currentStep, playbackState } = state;
  const primitive = useAnimation().primitive;
  const containerRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(-1);

  const step = primitive.steps[currentStep];
  const data = step?.data as {
    latex?: string;
    highlight?: string;
    from?: string;
    to?: string;
    annotation?: string;
    color?: string;
  };

  // Render KaTeX and animate on step change
  useEffect(() => {
    if (!containerRef.current || !data) return;

    const isFirstRender = prevStepRef.current === -1;
    prevStepRef.current = currentStep;

    const latex = data.latex ?? data.to ?? "";
    if (!latex) return;

    let html = "";
    try {
      html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        trust: false,
      });
    } catch {
      html = `<span class="text-red-400 text-sm">${latex}</span>`;
    }

    const container = containerRef.current;

    if (step.action === "transform" && data.from) {
      // Show old → new transition
      const fromHtml = (() => {
        try {
          return katex.renderToString(data.from, {
            throwOnError: false,
            displayMode: true,
            trust: false,
          });
        } catch {
          return data.from;
        }
      })();

      container.innerHTML = `<div class="equation-from">${fromHtml}</div><div class="equation-to opacity-0">${html}</div>`;
      const from = container.querySelector(".equation-from");
      const to = container.querySelector(".equation-to");

      gsap.to(from, { opacity: 0, y: -8, duration: 0.3 });
      gsap.to(to, { opacity: 1, y: 0, duration: 0.3, delay: 0.25 });
    } else {
      container.innerHTML = `<div class="equation-content">${html}</div>`;
      const content = container.querySelector(".equation-content");

      if (isFirstRender || step.transition === "fade") {
        gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      }
    }

    // Highlight specific term after a short delay
    if (step.action === "highlight" && data.highlight && data.highlight.length > 0) {
      setTimeout(() => {
        if (!containerRef.current) return;
        // Wrap matched KaTeX spans with a highlight class
        // KaTeX renders each token as separate spans; we highlight the whole block
        const spans = containerRef.current.querySelectorAll(".katex-html .base");
        spans.forEach((span) => {
          gsap.to(span, {
            color: data.color ?? "#2B9DB0",
            duration: 0.4,
            ease: "power2.out",
          });
        });
      }, 200);
    }
  }, [currentStep, data, step, playbackState]);

  return (
    <div className="flex flex-col items-center gap-3 py-4 px-2 min-h-[80px]">
      {step?.action === "annotate" && data?.annotation && (
        <p className="text-xs text-[#2B9DB0] font-medium bg-[#2B9DB0]/10 px-3 py-1 rounded-full">
          {data.annotation}
        </p>
      )}
      <div
        ref={containerRef}
        className="overflow-x-auto w-full flex justify-center text-gray-800"
      />
      {!data?.latex && !data?.to && (
        <span className="text-sm text-gray-400 italic">Ingen ekvation</span>
      )}
    </div>
  );
}
