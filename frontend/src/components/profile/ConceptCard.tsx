import type { ConceptMastery } from "../../types";

interface ConceptCardProps {
  concept: ConceptMastery;
}

const MAX_LEVEL = 5;

function MasteryStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Nivå ${level} av ${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < level ? "text-[#2B9DB0]" : "text-gray-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function masteryLabel(level: number): string {
  if (level >= 5) return "Behärskar";
  if (level >= 3) return "Lär sig";
  return "Utforskar";
}

function masteryBadgeClass(level: number): string {
  if (level >= 5) return "bg-teal-50 text-teal-700 border border-teal-200";
  if (level >= 3) return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-gray-50 text-gray-600 border border-gray-200";
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const displayName = concept.concept.charAt(0).toUpperCase() + concept.concept.slice(1);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 truncate">{displayName}</span>
        <MasteryStars level={concept.level} />
      </div>
      <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${masteryBadgeClass(concept.level)}`}>
        {masteryLabel(concept.level)}
      </span>
    </div>
  );
}
