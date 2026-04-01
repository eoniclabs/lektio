import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useConceptMastery } from "../../hooks/useConceptMastery";
import { ConceptCard } from "./ConceptCard";
import type { ConceptMastery } from "../../types";

interface ConceptMasteryPageProps {
  profileId: string;
  onClose: () => void;
}

type MasteryGroup = {
  label: string;
  emoji: string;
  concepts: ConceptMastery[];
};

function groupConcepts(concepts: ConceptMastery[]): MasteryGroup[] {
  const mastering = concepts.filter((c) => c.level >= 5);
  const learning = concepts.filter((c) => c.level >= 3 && c.level < 5);
  const exploring = concepts.filter((c) => c.level < 3);

  const groups: MasteryGroup[] = [];
  if (mastering.length > 0) groups.push({ label: "Behärskar", emoji: "🏆", concepts: mastering });
  if (learning.length > 0) groups.push({ label: "Lär sig", emoji: "📚", concepts: learning });
  if (exploring.length > 0) groups.push({ label: "Utforskar", emoji: "🔍", concepts: exploring });
  return groups;
}

export function ConceptMasteryPage({ profileId, onClose }: ConceptMasteryPageProps) {
  const { concepts, isLoading } = useConceptMastery(profileId);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
      );
    }
  }, []);

  const groups = groupConcepts(concepts);

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

        <span className="font-bold text-lg text-[#2B9DB0]">Mina begrepp</span>

        <div className="w-8" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-2 border-[#2B9DB0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : concepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
            <div className="text-4xl mb-4">🧠</div>
            <p className="text-gray-700 font-medium mb-2">Inga begrepp ännu</p>
            <p className="text-gray-500 text-sm">
              Begrepp visas här automatiskt när du chattar och lär dig nya saker
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Summary bar */}
            <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl border border-teal-100">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  {concepts.length} begrepp inlärda
                </p>
                <p className="text-xs text-teal-600">
                  {concepts.filter((c) => c.level >= 5).length} behärskade,{" "}
                  {concepts.filter((c) => c.level >= 3 && c.level < 5).length} under inlärning
                </p>
              </div>
            </div>

            {/* Groups */}
            {groups.map((group) => (
              <section key={group.label}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{group.emoji}</span>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {group.label}
                  </h2>
                  <span className="text-xs text-gray-400">({group.concepts.length})</span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.concepts.map((concept) => (
                    <ConceptCard key={concept.concept} concept={concept} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
