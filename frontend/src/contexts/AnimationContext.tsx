import { createContext, useContext } from "react";
import type { AnimationDirectorState, AnimationDirectorControls } from "../hooks/useAnimationDirector";
import type { VisualPrimitive } from "../types";

export interface AnimationContextValue {
  state: AnimationDirectorState;
  controls: AnimationDirectorControls;
  primitive: VisualPrimitive;
}

export const AnimationContext = createContext<AnimationContextValue | null>(null);

export function useAnimation(): AnimationContextValue {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error("useAnimation must be used inside an AnimationProvider");
  return ctx;
}
