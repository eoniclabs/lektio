import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { NotebookEntry } from "../../types";

interface NotebookCardProps {
  entry: NotebookEntry;
  onDelete: (id: string) => void;
}

function formatSwedishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function NotebookCard({ entry, onDelete }: NotebookCardProps) {
  const [expanded, setExpanded] = useState(false);

  const displayTitle =
    entry.title && entry.title.trim()
      ? entry.title
      : entry.content.slice(0, 50) + (entry.content.length > 50 ? "…" : "");

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <p className="font-semibold text-gray-800 text-sm leading-snug">
            {displayTitle}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatSwedishDate(entry.createdAt)}
          </p>
        </button>

        <button
          onClick={() => onDelete(entry.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
          title="Radera"
        >
          🗑️
        </button>
      </div>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#2B9DB0]/10 text-[#2B9DB0] rounded-full px-2 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700 prose prose-sm max-w-none prose-headings:text-gray-900 prose-code:text-[#2B9DB0] prose-code:bg-[#2B9DB0]/10 prose-code:rounded prose-code:px-1">
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
