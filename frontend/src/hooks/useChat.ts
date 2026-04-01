import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";
import { sendChatMessage } from "../services/chatStream";
import { conversationsApi } from "../services/conversations";
import type { ChatMessage } from "../types";

export function useChat(profileId: string) {
  const {
    messages,
    isLoading,
    conversationId,
    conversations,
    addMessage,
    updateLastMessage,
    finalizeLastMessage,
    setLoading,
    setConversationId,
    setConversations,
    removeConversation,
    updateConversationTitle,
    setMessages,
    clearMessages,
  } = useChatStore();

  const token = useAuthStore((s) => s.token);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the component unmounts
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Fetch conversations on mount when authenticated
  useEffect(() => {
    if (!token) return;
    conversationsApi.fetchConversations().then(setConversations).catch(() => {
      // Silently fail -- user will see empty list
    });
  }, [token, setConversations]);

  const sendMessage = useCallback(
    async (text: string, imageContext?: string, imageDataUrl?: string) => {
      if (!text.trim() && !imageContext) return;
      if (isLoading) return;

      // Abort any previous request and create a fresh controller
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Add user message
      addMessage({
        id: uuidv4(),
        role: "user",
        content: text.trim() || (imageDataUrl ? "[Foto av boksida]" : ""),
        imageUrl: imageDataUrl,
        timestamp: new Date().toISOString(),
      });

      // Add empty assistant placeholder
      addMessage({
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      });

      setLoading(true);

      try {
        await sendChatMessage(
          { message: text.trim(), conversationId, profileId, imageContext },
          {
            onDelta: (tkn) => updateLastMessage(tkn),
            onDone: (response) => {
              finalizeLastMessage(response.text, response.narration ?? undefined, response.visualPrimitives ?? undefined);
              setConversationId(response.conversationId);
            },
            onError: (error) => {
              finalizeLastMessage(
                `*Något gick fel: ${error}*`,
              );
            },
          },
          abortRef.current.signal,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      isLoading,
      conversationId,
      profileId,
      addMessage,
      updateLastMessage,
      finalizeLastMessage,
      setLoading,
      setConversationId,
    ],
  );

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
    isLoading,
    conversationId,
    conversations,
    sendMessage,
    startNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
  };
}
