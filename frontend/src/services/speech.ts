/**
 * Speech service interface.
 * Web implementation uses Web Speech API.
 * Can be swapped for native STT later.
 */
export interface SpeechService {
  startListening(onResult: (text: string, isFinal: boolean) => void): void;
  stopListening(): void;
  isSupported(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => any;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const win = window as unknown as Record<string, unknown>;
  return (win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null) as
    | SpeechRecognitionConstructor
    | null;
}

export class WebSpeechService implements SpeechService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;

  isSupported(): boolean {
    return getSpeechRecognition() !== null;
  }

  startListening(onResult: (text: string, isFinal: boolean) => void): void {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    this.recognition = new Ctor();
    this.recognition.lang = "sv-SE";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      const isFinal = result.isFinal as boolean;
      onResult(text, isFinal);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      const error = event.error as string;
      if (error === "not-allowed") {
        onResult("Mikrofonåtkomst nekad", true);
      }
    };

    this.recognition.start();
  }

  stopListening(): void {
    this.recognition?.stop();
    this.recognition = null;
  }
}
