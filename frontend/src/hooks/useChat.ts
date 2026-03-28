import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "../stores/chat";
import { sendChatMessage } from "../services/chatStream";

export function useChat(profileId: string) {
  const {
    messages,
    isLoading,
    conversationId,
    addMessage,
    updateLastMessage,
    finalizeLastMessage,
    setLoading,
    setConversationId,
  } = useChatStore();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // Add user message
      addMessage({
        id: uuidv4(),
        role: "user",
        content: text.trim(),
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
          { message: text.trim(), conversationId, profileId },
          {
            onDelta: (token) => updateLastMessage(token),
            onDone: (response) => {
              finalizeLastMessage(response.text, response.narration ?? undefined);
              setConversationId(response.conversationId);
            },
            onError: (error) => {
              finalizeLastMessage(
                `*Något gick fel: ${error}*`,
              );
            },
          },
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

  return { messages, isLoading, sendMessage };
}
