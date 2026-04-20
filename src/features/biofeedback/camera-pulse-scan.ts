import { estimatePulseFromSamples } from "./pulse-estimator";
import { evaluatePulseSignal } from "./quality-gating";
import type {
  BiofeedbackDeviceMode,
  BiofeedbackFailureReason,
  BiofeedbackRawStatus,
  PulseSample,
  PulseScanResult,
} from "./types";

type RunPulseScanOptions = {
  durationMs?: number;
  onProgress?: (progress01: number) => void;
  signal?: AbortSignal;
  facingMode?: "environment" | "user";
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildScanFailure(
  rawStatus: BiofeedbackRawStatus,
  failureReason: BiofeedbackFailureReason,
  durationMs: number
): PulseScanResult {
  return {
    pulse: null,
    breathingRate: null,
    signalQuality: 0,
    durationMs,
    deviceMode: "unknown",
    rawStatus,
    failureReason,
    confidence: 0,
  };
}

function frameAverage(data: Uint8ClampedArray): { red: number; green: number; blue: number } {
  let red = 0;
  let green = 0;
  let blue = 0;
  const px = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    red += data[i];
    green += data[i + 1];
    blue += data[i + 2];
  }

  return {
    red: red / px,
    green: green / px,
    blue: blue / px,
  };
}

async function enableTorchIfPossible(track: MediaStreamTrack): Promise<boolean> {
  try {
    const caps = track.getCapabilities?.() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    if (!caps?.torch) return false;
    await track.applyConstraints({ advanced: [{ torch: true }] });
    return true;
  } catch {
    return false;
  }
}

export async function runPulseScan({
  durationMs = 35_000,
  onProgress,
  signal,
  facingMode = "environment",
}: RunPulseScanOptions = {}): Promise<PulseScanResult> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return buildScanFailure("unsupported", "camera_unavailable", 0);
  }

  if (signal?.aborted) {
    return buildScanFailure("canceled", "canceled", 0);
  }

  const startedAt = Date.now();
  let stream: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;
  let torchEnabled = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 },
      },
      audio: false,
    });

    const track = stream.getVideoTracks()[0];
    if (!track) {
      return buildScanFailure("unsupported", "camera_unavailable", Date.now() - startedAt);
    }

    torchEnabled = await enableTorchIfPossible(track);
    const deviceMode: BiofeedbackDeviceMode =
      facingMode === "environment" ? "rear_finger_scan" : "front_breath_assist";

    video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("video_metadata_error"));
      };
      const cleanup = () => {
        video?.removeEventListener("loadedmetadata", onLoaded);
        video?.removeEventListener("error", onError);
      };
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onError);
    });

    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return buildScanFailure("unsupported", "camera_unavailable", Date.now() - startedAt);
    }

    const samples: PulseSample[] = [];
    while (Date.now() - startedAt < durationMs) {
      if (signal?.aborted) {
        return buildScanFailure("canceled", "canceled", Date.now() - startedAt);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const avg = frameAverage(frame.data);
      const redDominance = avg.red / (avg.green + avg.blue + 1);
      const brightness = (avg.red + avg.green + avg.blue) / 3;
      const signalValue = avg.red - (avg.green + avg.blue) / 2;

      samples.push({
        t: Date.now() - startedAt,
        red: avg.red,
        green: avg.green,
        blue: avg.blue,
        redDominance,
        brightness,
        signal: signalValue,
      });

      onProgress?.(Math.min(1, (Date.now() - startedAt) / durationMs));
      await sleep(80);
    }

    const quality = evaluatePulseSignal(samples);
    const pulse = estimatePulseFromSamples(samples);
    const finalDuration = Date.now() - startedAt;
    const confidence = Math.min(quality.quality, pulse.confidence);

    if (quality.status !== "ok" || pulse.pulse == null) {
      return {
        pulse: null,
        breathingRate: null,
        signalQuality: Number(quality.quality.toFixed(2)),
        durationMs: finalDuration,
        deviceMode,
        rawStatus: "low_signal",
        failureReason: quality.failureReason ?? "unstable_signal",
        confidence: Number(confidence.toFixed(2)),
      };
    }

    return {
      pulse: pulse.pulse,
      breathingRate: null,
      signalQuality: Number(quality.quality.toFixed(2)),
      durationMs: finalDuration,
      deviceMode: torchEnabled ? deviceMode : "rear_finger_scan",
      rawStatus: "ok",
      confidence: Number(confidence.toFixed(2)),
    };
  } catch (error) {
    const finalDuration = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "unknown";

    if (message.includes("NotAllowedError") || message.includes("PermissionDeniedError")) {
      return buildScanFailure("permission_denied", "permission_denied", finalDuration);
    }
    if (message.includes("NotFoundError") || message.includes("OverconstrainedError")) {
      return buildScanFailure("unsupported", "camera_unavailable", finalDuration);
    }
    return buildScanFailure("low_signal", "unknown", finalDuration);
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }
}

