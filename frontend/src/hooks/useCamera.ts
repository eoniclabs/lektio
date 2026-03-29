import { useState, useRef, useCallback } from "react";
import { WebCameraService } from "../services/camera";
import { compressImage, dataUrlToBase64 } from "../utils/imageUtils";
import { analyzeImage } from "../services/imageAnalysis";
import type { ImageAnalysisResult } from "../services/imageAnalysis";

type CameraState = "idle" | "active" | "preview";

const cameraService = new WebCameraService();

export function useCamera() {
  const [state, setState] = useState<CameraState>("idle");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = useCallback(() => {
    setState("active");
  }, []);

  const close = useCallback(() => {
    cameraService.stopStream();
    setCapturedDataUrl(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setState("idle");
  }, []);

  const capture = useCallback(async () => {
    try {
      const blob = await cameraService.capturePhoto();
      const dataUrl = await compressImage(blob);
      setCapturedDataUrl(dataUrl);
      setState("preview");
    } catch (err) {
      console.error("Capture failed:", err);
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedDataUrl(null);
    setAnalysisResult(null);
    setState("active");
  }, []);

  const accept = useCallback(async (): Promise<{ result: ImageAnalysisResult; dataUrl: string } | null> => {
    if (!capturedDataUrl) return null;
    setIsAnalyzing(true);
    try {
      const base64 = dataUrlToBase64(capturedDataUrl);
      const result = await analyzeImage(base64, "image/jpeg");
      setAnalysisResult(result);
      return { result, dataUrl: capturedDataUrl };
    } catch (err) {
      console.error("Image analysis failed:", err);
      return null;
    } finally {
      setIsAnalyzing(false);
      cameraService.stopStream();
      setState("idle");
    }
  }, [capturedDataUrl]);

  const flipCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (videoRef.current) {
      cameraService.startStream(videoRef.current, next).catch(console.error);
    }
  }, [facingMode]);

  const startVideoStream = useCallback(() => {
    if (videoRef.current) {
      cameraService.startStream(videoRef.current, facingMode).catch(console.error);
    }
  }, [facingMode]);

  return {
    state,
    capturedDataUrl,
    analysisResult,
    isAnalyzing,
    facingMode,
    videoRef,
    open,
    close,
    capture,
    retake,
    accept,
    flipCamera,
    startVideoStream,
  };
}
