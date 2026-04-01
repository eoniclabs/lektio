import { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { VisualPrimitive } from "../../types";
import { PrimitiveRenderer } from "../primitives/PrimitiveRenderer";

interface VisualPrimitiveCardProps {
  primitive: VisualPrimitive;
}

const primitiveIcons: Record<string, string> = {
  Equation: "∑",
  CoordinateSystem: "📈",
  StepByStep: "📋",
  FlowChart: "🔀",
  Timeline: "📅",
  TextBlock: "📝",
  GeometricShape: "△",
  NumberLine: "↔",
  Matrix: "⊞",
  ParticleSystem: "⚛",
  CodeBlock: "{ }",
  Illustration: "🎨",
  TreeStructure: "🌳",
  ArrayVisualization: "[]",
  default: "✨",
};

const primitiveLabels: Record<string, string> = {
  Equation: "Ekvation",
  CoordinateSystem: "Koordinatsystem",
  StepByStep: "Steg för steg",
  FlowChart: "Flödesschema",
  Timeline: "Tidslinje",
  TextBlock: "Textblock",
  Illustration: "Illustration",
  default: "Visualisering",
};

function ExpandedModal({ primitive, onClose }: { primitive: VisualPrimitive; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(panelRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
  }, []);

  useEffect(() => () => { closeTweenRef.current?.kill(); }, []);

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    closeTweenRef.current = gsap.to(panelRef.current, {
      opacity: 0,
      y: 16,
      duration: 0.18,
      onComplete: onClose,
    });
  };

  const icon = primitiveIcons[primitive.type] ?? primitiveIcons.default;
  const label = primitiveLabels[primitive.type] ?? primitiveLabels.default;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-2 pb-4 sm:pb-0"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#2B9DB0]/10 flex items-center justify-center text-lg">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400">{primitive.steps.length} steg</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Primitive + controls */}
        <div className="px-4 py-3">
          <PrimitiveRenderer primitive={primitive} />
        </div>
      </div>
    </div>
  );
}

export function VisualPrimitiveCard({ primitive }: VisualPrimitiveCardProps) {
  const [expanded, setExpanded] = useState(false);

  const icon = primitiveIcons[primitive.type] ?? primitiveIcons.default;
  const label = primitiveLabels[primitive.type] ?? primitiveLabels.default;

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-2 w-full text-left border-2 border-[#2B9DB0]/20 rounded-xl p-3 bg-[#2B9DB0]/5 flex items-center gap-3 cursor-pointer hover:border-[#2B9DB0]/50 hover:bg-[#2B9DB0]/10 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-lg bg-[#2B9DB0]/10 flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[#2B9DB0]">{label}</div>
          <div className="text-xs text-gray-500">
            {primitive.steps.length} steg · tryck för att se
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#2B9DB0]/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#2B9DB0]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>

      {expanded && (
        <ExpandedModal primitive={primitive} onClose={() => setExpanded(false)} />
      )}
    </>
  );
}
