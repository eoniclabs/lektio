import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";
import { sendChatMessage } from "../services/chatStream";
import { conversationsApi } from "../services/conversations";
import type { ChatMessage } from "../types";

/**
 * Extract the "text" field content from a partial JSON stream.
 * The AI returns: {"text":"...actual content...","narration":"..."}
 * During streaming we want to show only the text content, not raw JSON.
 */
function extractStreamingText(raw: string): string {
  // Find the start of the "text" field value
  const marker = '"text"';
  const idx = raw.indexOf(marker);
  if (idx === -1) return "";

  // Find the opening quote of the value
  const colonIdx = raw.indexOf(":", idx + marker.length);
  if (colonIdx === -1) return "";

  const openQuote = raw.indexOf('"', colonIdx + 1);
  if (openQuote === -1) return "";

  // Extract content after the opening quote
  // Find the closing quote (handle escaped quotes)
  let content = "";
  let i = openQuote + 1;
  while (i < raw.length) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      // Handle escape sequences
      const next = raw[i + 1];
      if (next === "n") content += "\n";
      else if (next === '"') content += '"';
      else if (next === "\\") content += "\\";
      else if (next === "t") content += "\t";
      else content += next;
      i += 2;
    } else if (raw[i] === '"') {
      // End of text field
      break;
    } else {
      content += raw[i];
      i++;
    }
  }

  return content;
}

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
  const rawStreamRef = useRef("");

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
      rawStreamRef.current = "";

      try {
        await sendChatMessage(
          { message: text.trim(), conversationId, profileId, imageContext },
          {
            onDelta: (tkn) => {
              rawStreamRef.current += tkn;
              const extracted = extractStreamingText(rawStreamRef.current);
              // Replace the entire assistant message content with the extracted text
              const store = useChatStore.getState();
              const msgs = [...store.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = { ...last, content: extracted };
                useChatStore.setState({ messages: msgs });
              }
            },
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
