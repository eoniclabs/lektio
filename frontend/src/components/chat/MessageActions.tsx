import { useTts } from "../../hooks/useTts";

interface MessageActionsProps {
  content: string;
  narration?: string;
  onSave: () => void;
}

export function MessageActions({ content, narration, onSave }: MessageActionsProps) {
  const { speak, stop, isSpeaking } = useTts();

  const handleRead = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(narration ?? content.replace(/[#*`_~]/g, ""));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1 ml-9">
      <ActionButton title="Spara till anteckningsbok" onClick={onSave}>
        ⭐
      </ActionButton>
      <ActionButton title={isSpeaking ? "Stoppa" : "Läs upp"} onClick={handleRead}>
        {isSpeaking ? "⏹" : "🔊"}
      </ActionButton>
      <ActionButton title="Kopiera" onClick={handleCopy}>
        📋
      </ActionButton>
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="text-sm px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {children}
    </button>
  );
}
