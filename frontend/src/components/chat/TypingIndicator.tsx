export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="w-7 h-7 rounded-full bg-[#2B9DB0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
        L
      </div>
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
