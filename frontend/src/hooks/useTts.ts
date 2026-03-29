import { useState, useCallback, useEffect, useRef } from "react";

export function useTts() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      stop();
      abortRef.current = new AbortController();
      setIsSpeaking(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error("TTS unavailable");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setIsSpeaking(false);
          return;
        }
        // Clean up any half-created blob before falling back
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        audioRef.current = null;
        console.error("TTS API failed, falling back to Web Speech:", err);
        // Fallback to Web Speech
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "sv-SE";
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    },
    [stop],
  );

  // Cleanup on unmount
  useEffect(() => () => { stop(); }, [stop]);

  return { speak, stop, isSpeaking, isSupported: "speechSynthesis" in window };
}
