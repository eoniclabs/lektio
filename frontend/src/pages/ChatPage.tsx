import { useCallback, useEffect, useRef, useState } from "react";
import { AuthModal } from "../components/auth/AuthModal";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { MessageList } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { CameraOverlay } from "../components/camera/CameraOverlay";
import { ImagePreview } from "../components/camera/ImagePreview";
import { NotebookPage } from "../components/notebook/NotebookPage";
import { ExamPage } from "../components/exam/ExamPage";
import { StreakBadge } from "../components/profile/StreakBadge";
import { ConceptMasteryPage } from "../components/profile/ConceptMasteryPage";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useSpeech } from "../hooks/useSpeech";
import { useCamera } from "../hooks/useCamera";
import { useTts } from "../hooks/useTts";
import { useNotebook } from "../hooks/useNotebook";
import { fetchProfileStats } from "../services/notebook";
import type { ChatMessage, ProfileStats } from "../types";

export function ChatPage() {
  const { isAuthenticated, profileId, logout } = useAuth();
  const {
    messages,
    isLoading,
    conversationId,
    conversations,
    sendMessage,
    startNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
  } = useChat(profileId ?? "");

  const camera = useCamera();
  const { speak: speakNarration, stop: stopNarration } = useTts();
  const prevLoadingRef = useRef(isLoading);
  const [autoRead, setAutoRead] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showConcepts, setShowConcepts] = useState(false);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const notebook = useNotebook(profileId ?? "");

  const { isListening, isSupported, startListening, stopListening, interimText } = useSpeech(
    (text) => sendMessage(text),
  );

  // Auto-play narration when a new assistant message arrives (if enabled)
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;
    if (autoRead && wasLoading && !isLoading) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.narration) {
        speakNarration(last.narration);
      }
    }
  }, [isLoading, messages, speakNarration, autoRead]);

  // Fetch profile stats on mount and after each completed message
  useEffect(() => {
    if (!profileId) return;
    const wasLoading = prevLoadingRef.current;
    if (!isLoading && (wasLoading || profileStats === null)) {
      fetchProfileStats(profileId)
        .then(setProfileStats)
        .catch((err) => console.error("Failed to fetch profile stats:", err));
    }
  }, [profileId, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Auth gate
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Öppna chattar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => { setAutoRead((v) => { if (v) stopNarration(); return !v; }); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-lg ${
              autoRead ? "bg-[#2B9DB0]/10 text-[#2B9DB0]" : "text-gray-400 hover:bg-gray-100"
            }`}
            title={autoRead ? "Stäng av automatisk uppläsning" : "Slå på automatisk uppläsning"}
          >
            {autoRead ? "🔊" : "🔇"}
          </button>
        </div>

        <span className="font-bold text-lg text-[#2B9DB0]">Lektio</span>

        <div className="flex items-center gap-2">
          <StreakBadge streakDays={profileStats?.streakDays ?? 0} />
          <button
            onClick={() => setShowConcepts(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
            title="Mina begrepp"
          >
            🧠
          </button>
          <button
            onClick={() => setShowExam(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
            title="Examensprov"
          >
            📝
          </button>
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

      {/* Input -- only shown when profile is loaded */}
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

      {/* Exam overlay */}
      {showExam && profileId && (
        <ExamPage
          profileId={profileId}
          onClose={() => setShowExam(false)}
        />
      )}

      {/* Concept mastery overlay */}
      {showConcepts && profileId && (
        <ConceptMasteryPage
          profileId={profileId}
          onClose={() => setShowConcepts(false)}
        />
      )}

      {/* Chat drawer */}
      <ChatDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversations}
        activeConversationId={conversationId}
        onNewChat={startNewChat}
        onSelectConversation={loadConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onLogout={logout}
      />
    </div>
  );
}
