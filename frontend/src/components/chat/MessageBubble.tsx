import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../../types";
import { VisualPrimitiveCard } from "./VisualPrimitiveCard";
import { MessageActions } from "./MessageActions";

interface MessageBubbleProps {
  message: ChatMessage;
  onSave: (message: ChatMessage) => void;
}

export function MessageBubble({ message, onSave }: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[78%] bg-[#2B9DB0] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-1">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-[#2B9DB0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
          L
        </div>
        <div className="max-w-[85%]">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800 prose prose-sm max-w-none prose-headings:text-gray-900 prose-code:text-[#2B9DB0] prose-code:bg-[#2B9DB0]/10 prose-code:rounded prose-code:px-1">
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <span className="text-gray-400 italic">Skriver...</span>
            )}
          </div>

          {message.visualPrimitives?.map((p, i) => (
            <VisualPrimitiveCard key={`${p.type}-${i}`} primitive={p} />
          ))}
        </div>
      </div>

      {message.content && (
        <MessageActions
          content={message.content}
          narration={message.narration}
          onSave={() => onSave(message)}
        />
      )}
    </div>
  );
}
