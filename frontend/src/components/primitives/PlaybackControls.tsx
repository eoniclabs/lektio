import { useAnimation } from "../../contexts/AnimationContext";
import type { PlaybackSpeed } from "../../hooks/useAnimationDirector";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const { state, controls, primitive } = useAnimation();
  const { currentStep, totalSteps, playbackState, speed } = state;
  const { play, pause, nextStep, prevStep, seekTo, setSpeed } = controls;
  const isPlaying = playbackState === "playing";
  const currentStepData = primitive.steps[currentStep];

  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Narration text */}
      {currentStepData?.narration && (
        <p className="text-sm text-gray-600 text-center min-h-[2.5rem] flex items-center justify-center px-2 italic">
          {currentStepData.narration}
        </p>
      )}

      {/* Step scrubber */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{currentStep + 1}</span>
        <div className="relative flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#2B9DB0] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-6 tabular-nums">{totalSteps}</span>
      </div>

      {/* Step dots for small step counts */}
      {totalSteps <= 10 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => seekTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentStep
                  ? "w-2.5 h-2.5 bg-[#2B9DB0]"
                  : i < currentStep
                  ? "w-2 h-2 bg-[#2B9DB0]/40"
                  : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Previous */}
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Föregående steg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? pause : play}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#2B9DB0] text-white hover:bg-[#2490a3] transition-colors shadow-sm shadow-[#2B9DB0]/30"
          title={isPlaying ? "Pausa" : "Spela upp"}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Nästa steg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5-4v8l-5.5-4zM16 6h2v12h-2z" />
          </svg>
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center justify-center gap-1.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              speed === s
                ? "bg-[#2B9DB0] text-white"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
