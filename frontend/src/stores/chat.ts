import { create } from "zustand";
import type { ChatMessage, ConversationSummary } from "../types";

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  conversations: ConversationSummary[];
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  setConversations: (convos: ConversationSummary[]) => void;
  addConversation: (convo: ConversationSummary) => void;
  removeConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationId: null,
  conversations: [],
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [], conversationId: null }),
  setConversationId: (id) => set({ conversationId: id }),
  setConversations: (convos) => set({ conversations: convos }),
  addConversation: (convo) =>
    set((state) => ({ conversations: [convo, ...state.conversations] })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    })),
  updateConversationTitle: (id, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c,
      ),
    })),
  setMessages: (messages) => set({ messages }),
}));
