import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useNotebook } from "../../hooks/useNotebook";
import { NotebookCard } from "./NotebookCard";

interface NotebookPageProps {
  profileId: string;
  onClose: () => void;
}

export function NotebookPage({ profileId, onClose }: NotebookPageProps) {
  const { entries, isLoading, remove } = useNotebook(profileId);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="Tillbaka"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-bold text-lg text-[#2B9DB0]">Anteckningsbok</span>

        <div className="w-8" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-2 border-[#2B9DB0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
            <div className="text-4xl mb-4">📓</div>
            <p className="text-gray-500 text-sm">
              Spara förklaringar från chatten för att se dem här
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <NotebookCard key={entry.id} entry={entry} onDelete={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
