import { useState, useCallback, useEffect, useRef } from "react";

export function useTts() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
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
      setIsSpeaking(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
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
      } catch {
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
