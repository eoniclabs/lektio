/**
 * Speech service interface.
 * Web implementation uses Web Speech API.
 * Can be swapped for native STT later.
 */
export interface SpeechService {
  startListening(onResult: (text: string) => void): void;
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

  startListening(onResult: (text: string) => void): void {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    this.recognition = new Ctor();
    this.recognition.lang = "sv-SE";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.start();
  }

  stopListening(): void {
    this.recognition?.stop();
    this.recognition = null;
  }
}
