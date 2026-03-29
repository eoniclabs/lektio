export class WebSpeechTtsService {
  speak(text: string, options?: { rate?: number; onEnd?: () => void }): void {
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    u.rate = options?.rate ?? 1;
    if (options?.onEnd) u.onend = options.onEnd;
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    window.speechSynthesis.cancel();
  }

  isSupported(): boolean {
    return "speechSynthesis" in window;
  }
}
