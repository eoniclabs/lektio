import { useCallback, useEffect } from "react";
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";
import { conversationsApi } from "../services/conversations";
import type { ChatMessage } from "../types";

export function useChat() {
  const {
    messages,
    conversationId,
    conversations,
    isLoading,
    addMessage,
    setLoading,
    clearMessages,
    setConversationId,
    setConversations,
    addConversation,
    removeConversation,
    updateConversationTitle,
    setMessages,
  } = useChatStore();

  const token = useAuthStore((s) => s.token);

  // Fetch conversations on mount when authenticated
  useEffect(() => {
    if (!token) return;
    conversationsApi.fetchConversations().then(setConversations).catch(() => {
      // Silently fail — user will see empty list
    });
  }, [token, setConversations]);

  const startNewChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const loadConversation = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const detail = await conversationsApi.loadConversation(id);
        setConversationId(detail.id);
        const mapped: ChatMessage[] = detail.messages.map((m, i) => ({
          id: `${detail.id}-${i}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          imageUrl: m.imageUrl,
          timestamp: m.timestamp,
        }));
        setMessages(mapped);
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    },
    [setConversationId, setMessages, setLoading],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        await conversationsApi.renameConversation(id, title);
        updateConversationTitle(id, title);
      } catch {
        // Failed to rename
      }
    },
    [updateConversationTitle],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await conversationsApi.deleteConversation(id);
        removeConversation(id);
        // If we deleted the active conversation, clear messages
        if (useChatStore.getState().conversationId === id) {
          clearMessages();
        }
      } catch {
        // Failed to delete
      }
    },
    [removeConversation, clearMessages],
  );

  return {
    messages,
    conversationId,
    conversations,
    isLoading,
    addMessage,
    setLoading,
    setConversationId,
    addConversation,
    startNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
  };
}
