import { useState, useEffect, useRef } from "react";
import { WebSpeechService } from "../services/speech";

const speechService = new WebSpeechService();

export function useSpeech(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const isSupported = speechService.isSupported();

  const startListening = () => {
    if (!isSupported || isListening) return;
    setIsListening(true);
    speechService.startListening((text) => {
      onResultRef.current(text);
      setIsListening(false);
    });
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => speechService.stopListening();
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
