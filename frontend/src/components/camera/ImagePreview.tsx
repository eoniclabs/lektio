interface ImagePreviewProps {
  dataUrl: string;
  isAnalyzing: boolean;
  onRetake: () => void;
  onAccept: () => void;
}

export function ImagePreview({
  dataUrl,
  isAnalyzing,
  onRetake,
  onAccept,
}: ImagePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Image fill */}
      <img
        src={dataUrl}
        alt="Captured"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-medium text-sm">Analyserar...</span>
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={onRetake}
          disabled={isAnalyzing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-40"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-white font-semibold text-sm drop-shadow">Granska bilden</span>

        <div className="w-10" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom bar */}
      <div className="relative z-10 px-4 pb-12 pt-4 flex flex-col gap-3">
        <button
          onClick={onAccept}
          disabled={isAnalyzing}
          className="w-full py-4 bg-[#2B9DB0] text-white font-semibold rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          Skicka
        </button>
        <button
          onClick={onRetake}
          disabled={isAnalyzing}
          className="w-full py-3 text-white/80 text-sm disabled:opacity-40"
        >
          Ta om bilden
        </button>
      </div>
    </div>
  );
}
