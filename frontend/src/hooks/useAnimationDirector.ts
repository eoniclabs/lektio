import { useState, useCallback, useEffect, useRef } from "react";
import type { VisualStep } from "../types";

export type PlaybackState = "idle" | "playing" | "paused";
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface AnimationDirectorState {
  currentStep: number;
  totalSteps: number;
  playbackState: PlaybackState;
  speed: PlaybackSpeed;
}

export interface AnimationDirectorControls {
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  seekTo: (index: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}

export function useAnimationDirector(steps: VisualStep[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalSteps = steps.length;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Auto-advance logic
  useEffect(() => {
    if (playbackState !== "playing") {
      clearTimer();
      return;
    }

    const stepDuration = (steps[currentStep]?.durationMs ?? 1000) / speed;
    timerRef.current = setTimeout(() => {
      setCurrentStep((s) => {
        if (s >= totalSteps - 1) {
          setPlaybackState("paused");
          return s;
        }
        return s + 1;
      });
    }, stepDuration);

    return clearTimer;
  }, [playbackState, currentStep, speed, steps, totalSteps]);

  // Clean up on unmount
  useEffect(() => () => clearTimer(), []);

  const play = useCallback(() => {
    setCurrentStep((s) => {
      // Restart from beginning if already at the end
      if (s >= totalSteps - 1) return 0;
      return s;
    });
    setPlaybackState("playing");
  }, [totalSteps]);

  const pause = useCallback(() => {
    setPlaybackState("paused");
  }, []);

  const nextStep = useCallback(() => {
    clearTimer();
    setPlaybackState("paused");
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    clearTimer();
    setPlaybackState("paused");
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const seekTo = useCallback(
    (index: number) => {
      clearTimer();
      setPlaybackState("paused");
      setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [totalSteps],
  );

  const setSpeed = useCallback((s: PlaybackSpeed) => {
    setSpeedState(s);
  }, []);

  const state: AnimationDirectorState = {
    currentStep,
    totalSteps,
    playbackState,
    speed,
  };

  const controls: AnimationDirectorControls = {
    play,
    pause,
    nextStep,
    prevStep,
    seekTo,
    setSpeed,
  };

  return { state, controls };
}
