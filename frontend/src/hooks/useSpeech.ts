import { useState, useEffect, useRef } from "react";
import { WebSpeechService } from "../services/speech";

export function useSpeech(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Hold the service instance in a ref so it survives re-renders but is
  // not shared across HMR module boundaries in dev.
  const serviceRef = useRef<WebSpeechService | null>(null);
  if (!serviceRef.current) serviceRef.current = new WebSpeechService();
  const speechService = serviceRef.current;

  const isSupported = speechService.isSupported();

  const startListening = () => {
    if (!isSupported || isListening) return;
    setIsListening(true);
    speechService.startListening((text, isFinal) => {
      if (isFinal) {
        onResultRef.current(text);
        setInterimText("");
        setIsListening(false);
      } else {
        setInterimText(text);
      }
    });
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    setInterimText("");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => speechService.stopListening();
  }, [speechService]);

  return { isListening, isSupported, startListening, stopListening, interimText };
}
