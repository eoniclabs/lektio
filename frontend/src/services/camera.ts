/**
 * Camera service interface.
 * Web implementation uses getUserMedia.
 * Can be swapped for Capacitor native plugin later.
 */
export interface CameraService {
  capturePhoto(): Promise<Blob>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
}

export class WebCameraService implements CameraService {
  async capturePhoto(): Promise<Blob> {
    // TODO: Implement with getUserMedia + canvas capture
    throw new Error("Not implemented");
  }

  async hasPermission(): Promise<boolean> {
    const status = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return status.state === "granted";
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
