import type { ChatRequest, ChatResponse } from "../types";

export interface StreamCallbacks {
  onDelta: (token: string) => void;
  onDone: (response: ChatResponse) => void;
  onError: (message: string) => void;
}

export async function sendChatMessage(
  request: ChatRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    callbacks.onError(`API error: ${response.status}`);
    return;
  }

  if (!response.body) {
    callbacks.onError("No response body");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const chunk of lines) {
        const dataLine = chunk
          .split("\n")
          .find((l) => l.startsWith("data: "));
        if (!dataLine) continue;

        const json = dataLine.slice("data: ".length).trim();
        if (!json) continue;

        try {
          const event = JSON.parse(json) as {
            type: string;
            token?: string;
            response?: ChatResponse;
            error?: string;
          };

          if (event.type === "delta" && event.token) {
            callbacks.onDelta(event.token);
          } else if (event.type === "done" && event.response) {
            callbacks.onDone(event.response);
          } else if (event.type === "error") {
            callbacks.onError(event.error ?? "Unknown error");
          }
        } catch {
          // Malformed SSE line – skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
