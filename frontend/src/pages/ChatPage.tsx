import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { AuthModal } from "../components/auth/AuthModal";
import { ChatDrawer } from "../components/chat/ChatDrawer";

export function ChatPage() {
  const { isAuthenticated, name, logout } = useAuth();
  const {
    conversations,
    conversationId,
    startNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
  } = useChat();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Öppna chattar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#2B9DB0]">Lektio</h1>
        </div>

        {name && (
          <span className="text-sm text-gray-500">
            {name}
          </span>
        )}
      </header>

      {/* Main content area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2B9DB0]">
            {conversationId ? "Chatt" : "Välkommen!"}
          </h2>
          <p className="mt-2 text-gray-500">
            {conversationId
              ? "Chatten laddas här"
              : "Tryck på menyn för att se dina chattar eller starta en ny"}
          </p>
        </div>
      </div>

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
