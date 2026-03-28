import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSave: (message: ChatMessage) => void;
  onPrompt: (text: string) => void;
}

export function MessageList({ messages, isLoading, onSave, onPrompt }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return <EmptyState onPrompt={onPrompt} />;
  }

  return (
    <div className="flex-1 overflow-y-auto py-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onSave={onSave} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <TypingIndicator />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
