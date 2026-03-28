export interface StudentProfile {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  preferences: StudentPreferences;
  conceptMastery: Record<string, number>;
  streakDays: number;
  createdAt: string;
}

export type SchoolLevel =
  | "mellanstadiet"
  | "hogstadiet"
  | "gymnasiet"
  | "hogskola";

export interface StudentPreferences {
  explanationStyle: "visual_first" | "detailed" | "concise";
  voiceEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  visualPrimitives?: VisualPrimitive[];
  timestamp: string;
}

export interface VisualPrimitive {
  type: string;
  steps: VisualStep[];
}

export interface VisualStep {
  action: string;
  data: Record<string, unknown>;
  narration: string;
  audioDurationMs?: number;
  transition: "draw" | "fade" | "morph" | "slide";
  durationMs: number;
}
