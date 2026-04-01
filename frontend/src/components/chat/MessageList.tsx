import { useEffect, useRef, useCallback } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevMessageCountRef = useRef(messages.length);

  // Detect if user scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 100;
  }, []);

  useEffect(() => {
    // Always scroll on new message (user or assistant added)
    if (messages.length !== prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      userScrolledUpRef.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // During streaming, only auto-scroll if user hasn't scrolled up
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return <EmptyState onPrompt={onPrompt} />;
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-3">
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
