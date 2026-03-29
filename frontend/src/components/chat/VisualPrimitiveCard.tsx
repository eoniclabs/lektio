import type { VisualPrimitive } from "../../types";

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
  TreeStructure: "🌳",
  ArrayVisualization: "[]",
  default: "✨",
};

export function VisualPrimitiveCard({ primitive }: VisualPrimitiveCardProps) {
  const icon = primitiveIcons[primitive.type] ?? primitiveIcons.default;

  return (
    <div className="mt-2 border-2 border-[#2B9DB0]/20 rounded-xl p-3 bg-[#2B9DB0]/5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#2B9DB0]/10 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#2B9DB0]">
          {primitive.type}
        </div>
        <div className="text-xs text-gray-500">
          {primitive.steps.length} steg · animation kommer i M2
        </div>
      </div>
      <div className="ml-auto">
        <div className="w-7 h-7 rounded-full bg-[#2B9DB0]/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#2B9DB0]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
