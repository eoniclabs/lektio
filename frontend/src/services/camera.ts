export interface CameraService {
  startStream(videoEl: HTMLVideoElement, facingMode?: "environment" | "user"): Promise<void>;
  stopStream(): void;
  capturePhoto(): Promise<Blob>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
}

export class WebCameraService implements CameraService {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;

  async startStream(
    videoEl: HTMLVideoElement,
    facingMode: "environment" | "user" = "environment",
  ): Promise<void> {
    this.stopStream();
    this.videoEl = videoEl;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
    videoEl.srcObject = this.stream;
    await videoEl.play();
  }

  stopStream(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }
  }

  capturePhoto(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.videoEl) {
        reject(new Error("No active video stream"));
        return;
      }
      const { videoWidth, videoHeight } = this.videoEl;
      const canvas = document.createElement("canvas");
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(this.videoEl, 0, 0, videoWidth, videoHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to capture frame"));
        },
        "image/jpeg",
        0.95,
      );
    });
  }

  async hasPermission(): Promise<boolean> {
    try {
      const status = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return status.state === "granted";
    } catch {
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }
}
