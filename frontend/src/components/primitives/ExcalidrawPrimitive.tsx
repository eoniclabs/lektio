import { useEffect, useRef } from "react";
import { useAnimation } from "../../contexts/AnimationContext";

export function ExcalidrawPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const { convertToExcalidrawElements, exportToSvg } = await import(
        "@excalidraw/excalidraw"
      );

      // Accumulate elements from all steps up to currentStep
      // Clone elements so highlight mutations don't persist across renders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allElements: any[] = [];
      for (let i = 0; i <= currentStep; i++) {
        const step = primitive.steps[i];
        if (!step) continue;

        if (step.action === "addElements") {
          const elements = step.data?.elements;
          if (Array.isArray(elements)) {
            for (const el of elements) {
              allElements.push({ ...el });
            }
          }
        }

        if (step.action === "highlightElements") {
          const ids = step.data?.ids;
          if (Array.isArray(ids)) {
            const color = (step.data.color as string) || "#e06c75";
            for (const el of allElements) {
              if (ids.includes(el.id)) {
                el.strokeColor = color;
                el.strokeWidth = 3;
              }
            }
          }
        }
      }

      if (cancelled) return;

      const converted = convertToExcalidrawElements(allElements);

      const svg = await exportToSvg({
        elements: converted,
        appState: {
          viewBackgroundColor: "transparent",
          exportWithDarkMode: false,
        },
        files: null,
      });

      if (cancelled || !svgContainerRef.current) return;

      svgContainerRef.current.innerHTML = "";
      svg.style.width = "100%";
      svg.style.height = "auto";
      svgContainerRef.current.appendChild(svg);
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [currentStep, primitive.steps]);

  return (
    <div
      ref={svgContainerRef}
      className="w-full min-h-[200px] flex items-center justify-center"
    />
  );
}
