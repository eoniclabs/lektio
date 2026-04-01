import { AnimationContext } from "../../contexts/AnimationContext";
import { useAnimationDirector } from "../../hooks/useAnimationDirector";
import type { VisualPrimitive } from "../../types";
import { EquationPrimitive } from "./EquationPrimitive";
import { CoordinateSystemPrimitive } from "./CoordinateSystemPrimitive";
import { StepByStepPrimitive } from "./StepByStepPrimitive";
import { TextBlockPrimitive } from "./TextBlockPrimitive";
import { FlowChartPrimitive } from "./FlowChartPrimitive";
import { TimelinePrimitive } from "./TimelinePrimitive";
import { IllustrationPrimitive } from "./IllustrationPrimitive";
import { PlaybackControls } from "./PlaybackControls";

interface PrimitiveRendererProps {
  primitive: VisualPrimitive;
  /** When true, renders in compact inline mode without playback controls */
  inline?: boolean;
}

function PrimitiveContent({ type }: { type: string }) {
  switch (type) {
    case "Equation":
      return <EquationPrimitive />;
    case "CoordinateSystem":
      return <CoordinateSystemPrimitive />;
    case "StepByStep":
      return <StepByStepPrimitive />;
    case "TextBlock":
      return <TextBlockPrimitive />;
    case "FlowChart":
      return <FlowChartPrimitive />;
    case "Timeline":
      return <TimelinePrimitive />;
    case "Illustration":
      return <IllustrationPrimitive />;
    default:
      return (
        <div className="py-4 text-sm text-gray-400 text-center italic">
          Primitiv &ldquo;{type}&rdquo; stöds inte ännu
        </div>
      );
  }
}

export function PrimitiveRenderer({ primitive, inline = false }: PrimitiveRendererProps) {
  const { state, controls } = useAnimationDirector(primitive.steps);

  return (
    <AnimationContext.Provider value={{ state, controls, primitive }}>
      <div className="flex flex-col gap-3">
        <PrimitiveContent type={primitive.type} />
        {!inline && <PlaybackControls />}
      </div>
    </AnimationContext.Provider>
  );
}
