interface StreakBadgeProps {
  streakDays: number;
}

export function StreakBadge({ streakDays }: StreakBadgeProps) {
  if (streakDays <= 0) return null;

  return (
    <div className="flex items-center gap-1 text-sm font-semibold text-orange-500">
      <span>🔥</span>
      <span>{streakDays} dagar</span>
    </div>
  );
}
