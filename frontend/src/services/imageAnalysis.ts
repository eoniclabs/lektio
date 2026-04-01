export interface ImageAnalysisResult {
  extractedText: string;
  summary: string;
  mediaType: string;
}

export async function analyzeImage(
  base64: string,
  mediaType: string,
): Promise<ImageAnalysisResult> {
  const response = await fetch("/api/image/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, mediaType }),
  });

  if (!response.ok) {
    throw new Error(`Image analysis failed: ${response.status}`);
  }

  const data = await response.json() as { extractedText: string; summary: string; mediaType: string };
  return {
    extractedText: data.extractedText,
    summary: data.summary,
    mediaType: data.mediaType ?? mediaType,
  };
}
