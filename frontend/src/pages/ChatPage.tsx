import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { MessageList } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { useOnboarding } from "../hooks/useOnboarding";
import { useChat } from "../hooks/useChat";
import { useSpeech } from "../hooks/useSpeech";
import type { ChatMessage } from "../types";

export function ChatPage() {
  const { profileId, isReady, showOnboarding, completeOnboarding } = useOnboarding();
  const { messages, isLoading, sendMessage } = useChat(profileId ?? "");

  const { isListening, isSupported, startListening, stopListening } = useSpeech(
    (text) => sendMessage(text),
  );

  const handleMicClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSave = (_message: ChatMessage) => {
    // TODO: implement in M5 (Notebook)
    console.info("Save to notebook:", _message.id);
  };

  if (!isReady) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#2B9DB0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="font-bold text-lg text-[#2B9DB0]">Lektio</span>

        <div className="flex items-center gap-1 text-sm font-semibold text-orange-500">
          <span>🔥</span>
          <span>0</span>
        </div>
      </header>

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSave={handleSave}
        onPrompt={sendMessage}
      />

      {/* Input – only shown when profile is loaded */}
      {profileId && (
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          onMicClick={handleMicClick}
          isListening={isListening}
          isSpeechSupported={isSupported}
        />
      )}

      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </div>
  );
}
