import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string, imageContext?: string, imageDataUrl?: string) => void;
  isLoading: boolean;
  onMicClick: () => void;
  isListening: boolean;
  isSpeechSupported: boolean;
  onCameraClick: () => void;
}

export function ChatInput({
  onSend,
  isLoading,
  onMicClick,
  isListening,
  isSpeechSupported,
  onCameraClick,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-3 py-3">
      <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-3 py-2">
        {/* Camera button */}
        <button
          onClick={onCameraClick}
          title="Fota en boksida"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-[#2B9DB0] hover:bg-[#2B9DB0]/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Fråga om det du pluggar..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none py-1 max-h-[120px]"
        />

        {/* Mic button */}
        {isSpeechSupported && (
          <button
            onClick={onMicClick}
            title={isListening ? "Stoppa lyssning" : "Tala din fråga"}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
              isListening
                ? "bg-red-100 text-red-500 animate-pulse"
                : "text-gray-400 hover:text-[#2B9DB0] hover:bg-[#2B9DB0]/10"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-[#2B9DB0] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2490a3] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
