import { api } from "./api";
import type { ConversationSummary } from "../types";

interface ConversationDetail {
  id: string;
  profileId: string;
  title: string;
  messages: {
    role: string;
    content: string;
    imageUrl?: string;
    timestamp: string;
  }[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const conversationsApi = {
  fetchConversations: () =>
    api.get<ConversationSummary[]>("/conversations"),

  loadConversation: (id: string) =>
    api.get<ConversationDetail>(`/conversations/${id}`),

  renameConversation: (id: string, title: string) =>
    api.patch<void>(`/conversations/${id}/title`, { title }),

  deleteConversation: (id: string) =>
    api.delete<void>(`/conversations/${id}`),
};
