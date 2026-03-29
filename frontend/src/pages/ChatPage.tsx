import { useCallback, useEffect, useRef, useState } from "react";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { MessageList } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { CameraOverlay } from "../components/camera/CameraOverlay";
import { ImagePreview } from "../components/camera/ImagePreview";
import { NotebookPage } from "../components/notebook/NotebookPage";
import { StreakBadge } from "../components/profile/StreakBadge";
import { useOnboarding } from "../hooks/useOnboarding";
import { useChat } from "../hooks/useChat";
import { useSpeech } from "../hooks/useSpeech";
import { useCamera } from "../hooks/useCamera";
import { useTts } from "../hooks/useTts";
import { useNotebook } from "../hooks/useNotebook";
import { fetchProfileStats } from "../services/notebook";
import type { ChatMessage, ProfileStats } from "../types";

export function ChatPage() {
  const { profileId, isReady, showOnboarding, completeOnboarding } = useOnboarding();
  const { messages, isLoading, sendMessage } = useChat(profileId ?? "");
  const camera = useCamera();
  const { speak: speakNarration } = useTts();
  const prevLoadingRef = useRef(isLoading);
  const [showNotebook, setShowNotebook] = useState(false);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const notebook = useNotebook(profileId ?? "");

  const { isListening, isSupported, startListening, stopListening, interimText } = useSpeech(
    (text) => sendMessage(text),
  );

  // Auto-play narration when a new assistant message arrives
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;
    if (wasLoading && !isLoading) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.narration) {
        speakNarration(last.narration);
      }
    }
  }, [isLoading, messages, speakNarration]);

  // Fetch profile stats on mount and after each completed message
  useEffect(() => {
    if (!profileId) return;
    fetchProfileStats(profileId)
      .then(setProfileStats)
      .catch(() => {});
  }, [profileId, isLoading]);

  const handleMicClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSave = useCallback(
    (message: ChatMessage) => {
      notebook.save(message.content);
    },
    [notebook],
  );

  const handleAccept = useCallback(async () => {
    const accepted = await camera.accept();
    if (accepted) {
      await sendMessage("", accepted.result.extractedText, accepted.dataUrl);
    }
  }, [camera, sendMessage]);

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

        <div className="flex items-center gap-2">
          <StreakBadge streakDays={profileStats?.streakDays ?? 0} />
          <button
            onClick={() => setShowNotebook(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
            title="Anteckningsbok"
          >
            📓
          </button>
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
          onCameraClick={camera.open}
          interimText={interimText}
        />
      )}

      {/* Camera overlay */}
      {camera.state === "active" && (
        <CameraOverlay
          videoRef={camera.videoRef}
          onClose={camera.close}
          onCapture={camera.capture}
          onFlip={camera.flipCamera}
          onReady={camera.startVideoStream}
        />
      )}

      {/* Image preview */}
      {camera.state === "preview" && camera.capturedDataUrl && (
        <ImagePreview
          dataUrl={camera.capturedDataUrl}
          isAnalyzing={camera.isAnalyzing}
          onRetake={camera.retake}
          onAccept={handleAccept}
        />
      )}

      {/* Notebook overlay */}
      {showNotebook && profileId && (
        <NotebookPage
          profileId={profileId}
          onClose={() => setShowNotebook(false)}
        />
      )}

      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </div>
  );
}
