import { useAnimation } from "../../contexts/AnimationContext";
import type { PlaybackSpeed } from "../../hooks/useAnimationDirector";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const { state, controls, primitive } = useAnimation();
  const { currentStep, totalSteps, playbackState, speed, audioEnabled } = state;
  const { play, pause, nextStep, prevStep, seekTo, setSpeed, toggleAudio } = controls;
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

      {/* Speed selector + mute toggle */}
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
        <button
          onClick={toggleAudio}
          title={audioEnabled ? "Stäng av ljud" : "Slå på ljud"}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
            audioEnabled
              ? "text-[#2B9DB0] hover:bg-[#2B9DB0]/10"
              : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
          }`}
        >
          {audioEnabled ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
