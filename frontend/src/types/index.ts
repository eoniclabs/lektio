export interface StudentProfile {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  preferences: StudentPreferences;
  conceptMasteries: ConceptMastery[];
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
  narration?: string;
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

export interface ChatRequest {
  message: string;
  conversationId: string | null;
  profileId: string;
  imageContext?: string;
}

export interface ChatResponse {
  text: string;
  narration?: string;
  visualPrimitives?: VisualPrimitive[] | null;
  conversationId: string;
}

export interface OnboardingData {
  name: string;
  schoolLevel: SchoolLevel;
  preferences: StudentPreferences;
}

export interface NotebookEntry {
  id: string;
  profileId: string;
  content: string;
  title?: string;
  tags: string[];
  createdAt: string;
}

export interface ProfileStats {
  streakDays: number;
  totalMessages: number;
  conceptMasteries: Array<{ concept: string; level: number; lastSeenAt: string }>;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Exam {
  id: string;
  profileId: string;
  topic: string;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  profileId: string;
  answers: number[];
  score: number;
  total: number;
  completedAt: string;
}

export interface ConceptMastery {
  concept: string;
  level: number;
  lastSeenAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  profileId: string;
  name: string;
}
