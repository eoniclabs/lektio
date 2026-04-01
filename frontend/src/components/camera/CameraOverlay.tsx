import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { RefObject } from "react";

interface CameraOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onCapture: () => void;
  onFlip: () => void;
  onReady: () => void;
}

export function CameraOverlay({
  videoRef,
  onClose,
  onCapture,
  onFlip,
  onReady,
}: CameraOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    onReady();
  }, [onReady]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Video fill */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Guide frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="w-[85%] max-w-sm"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="296"
            height="196"
            rx="12"
            ry="12"
            stroke="white"
            strokeWidth="3"
            strokeDasharray="20 8"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="text-white font-semibold text-sm drop-shadow">Fota en boksida</span>

        <button
          onClick={onFlip}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom bar */}
      <div className="relative z-10 flex items-center justify-center pb-16 pt-4">
        <button
          onClick={onCapture}
          className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border-2 border-gray-300" />
        </button>
      </div>
    </div>
  );
}
