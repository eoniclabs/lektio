import { useCallback, useEffect, useRef } from "react";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { MessageList } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { CameraOverlay } from "../components/camera/CameraOverlay";
import { ImagePreview } from "../components/camera/ImagePreview";
import { useOnboarding } from "../hooks/useOnboarding";
import { useChat } from "../hooks/useChat";
import { useSpeech } from "../hooks/useSpeech";
import { useCamera } from "../hooks/useCamera";
import { useTts } from "../hooks/useTts";
import type { ChatMessage } from "../types";

export function ChatPage() {
  const { profileId, isReady, showOnboarding, completeOnboarding } = useOnboarding();
  const { messages, isLoading, sendMessage } = useChat(profileId ?? "");
  const camera = useCamera();
  const { speak: speakNarration } = useTts();
  const prevLoadingRef = useRef(isLoading);

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

  const handleMicClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSave = (_message: ChatMessage) => {
    console.info("Save to notebook:", _message.id);
  };

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

      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </div>
  );
}
