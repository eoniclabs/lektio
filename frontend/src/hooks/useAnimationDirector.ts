import { useState, useCallback, useEffect, useRef } from "react";
import type { VisualStep } from "../types";
import { WebSpeechTtsService } from "../services/tts";

export type PlaybackState = "idle" | "playing" | "paused";
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface AnimationDirectorState {
  currentStep: number;
  totalSteps: number;
  playbackState: PlaybackState;
  speed: PlaybackSpeed;
  audioEnabled: boolean;
}

export interface AnimationDirectorControls {
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  seekTo: (index: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  toggleAudio: () => void;
}

export function useAnimationDirector(steps: VisualStep[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsRef = useRef(new WebSpeechTtsService());
  const totalSteps = steps.length;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advanceToNext = () => {
    setCurrentStep((s) => {
      if (s >= totalSteps - 1) {
        setPlaybackState("paused");
        return s;
      }
      return s + 1;
    });
  };

  // Auto-advance + TTS narration (coordinated)
  useEffect(() => {
    if (playbackState !== "playing") {
      clearTimer();
      ttsRef.current.stop();
      return;
    }

    const stepDuration = (steps[currentStep]?.durationMs ?? 1000) / speed;
    const narration = steps[currentStep]?.narration;

    if (audioEnabled && narration) {
      // Speak narration, then wait stepDuration AFTER speech ends before advancing
      ttsRef.current.speak(narration, {
        rate: speed,
        onEnd: () => {
          // Brief pause after narration, then advance
          timerRef.current = setTimeout(advanceToNext, Math.min(stepDuration, 800));
        },
      });
    } else {
      // No audio — advance on timer only
      ttsRef.current.stop();
      timerRef.current = setTimeout(advanceToNext, stepDuration);
    }

    return () => {
      clearTimer();
      ttsRef.current.stop();
    };
  }, [playbackState, currentStep, speed, steps, totalSteps, audioEnabled]);

  // Clean up on unmount
  useEffect(() => () => {
    clearTimer();
    ttsRef.current.stop();
  }, []);

  const play = useCallback(() => {
    setCurrentStep((s) => {
      // Restart from beginning if already at the end
      if (s >= totalSteps - 1) return 0;
      return s;
    });
    setPlaybackState("playing");
  }, [totalSteps]);

  const pause = useCallback(() => {
    ttsRef.current.stop();
    setPlaybackState("paused");
  }, []);

  const nextStep = useCallback(() => {
    clearTimer();
    ttsRef.current.stop();
    setPlaybackState("paused");
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    clearTimer();
    ttsRef.current.stop();
    setPlaybackState("paused");
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const seekTo = useCallback(
    (index: number) => {
      clearTimer();
      ttsRef.current.stop();
      setPlaybackState("paused");
      setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [totalSteps],
  );

  const setSpeed = useCallback((s: PlaybackSpeed) => {
    setSpeedState(s);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((a) => {
      if (a) ttsRef.current.stop();
      return !a;
    });
  }, []);

  const state: AnimationDirectorState = {
    currentStep,
    totalSteps,
    playbackState,
    speed,
    audioEnabled,
  };

  const controls: AnimationDirectorControls = {
    play,
    pause,
    nextStep,
    prevStep,
    seekTo,
    setSpeed,
    toggleAudio,
  };

  return { state, controls };
}
