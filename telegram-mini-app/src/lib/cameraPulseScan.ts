import type { BiofeedbackFailureReason, PulseScanResult } from "./biofeedback";

type ScanOptions = {
  durationMs?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
};

type PulseSample = {
  timestamp: number;
  signal: number;
  redDominance: number;
  brightness: number;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = avg(values);
  const variance = avg(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFailure(
  rawStatus: PulseScanResult["rawStatus"],
  failureReason: BiofeedbackFailureReason,
  durationMs: number
): PulseScanResult {
  return {
    pulse: null,
    signalQuality: 0,
    durationMs,
    rawStatus,
    failureReason,
    confidence: 0,
  };
}

function frameAverage(data: Uint8ClampedArray): { red: number; green: number; blue: number } {
  let red = 0;
  let green = 0;
  let blue = 0;
  const pixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    red += data[i];
    green += data[i + 1];
    blue += data[i + 2];
  }

  return {
    red: red / pixels,
    green: green / pixels,
    blue: blue / pixels,
  };
}

function smoothSignal(samples: number[]): number[] {
  const window = 5;
  return samples.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    return avg(samples.slice(start, i + 1));
  });
}

function estimatePulse(samples: PulseSample[]): { pulse: number | null; confidence: number } {
  if (samples.length < 100) return { pulse: null, confidence: 0 };

  const values = smoothSignal(samples.map((sample) => sample.signal));
  const mean = avg(values);
  const deviation = std(values);
  if (deviation < 0.5) return { pulse: null, confidence: 0.1 };

  const threshold = mean + deviation * 0.18;
  const peaks: number[] = [];

  for (let i = 2; i < values.length - 2; i += 1) {
    const current = values[i];
    if (
      current > threshold &&
      current >= values[i - 1] &&
      current >= values[i + 1] &&
      current > values[i - 2] &&
      current > values[i + 2]
    ) {
      const peakTime = samples[i].timestamp;
      const last = peaks[peaks.length - 1];
      if (!last || peakTime - last >= 320) {
        peaks.push(peakTime);
      }
    }
  }

  if (peaks.length < 4) return { pulse: null, confidence: 0.2 };

  const intervals = peaks.slice(1).map((peak, index) => peak - peaks[index]);
  const filtered = intervals.filter((interval) => interval >= 380 && interval <= 1500);
  if (filtered.length < 3) return { pulse: null, confidence: 0.25 };

  const avgInterval = avg(filtered);
  const bpm = Math.round(60000 / avgInterval);
  if (bpm < 40 || bpm > 160) return { pulse: null, confidence: 0.3 };

  const intervalStability = clamp01(1 - std(filtered) / 220);
  return {
    pulse: bpm,
    confidence: Number((0.4 + intervalStability * 0.55).toFixed(2)),
  };
}

function evaluateQuality(samples: PulseSample[]): {
  quality: number;
  failureReason?: BiofeedbackFailureReason;
} {
  if (samples.length < 100) {
    return { quality: 0, failureReason: "unstable_signal" };
  }

  const redCoverage =
    samples.filter((sample) => sample.redDominance > 1.12).length / samples.length;

  const brightness = avg(samples.map((sample) => sample.brightness));
  const brightnessScore =
    brightness < 25
      ? clamp01(brightness / 25)
      : brightness > 245
        ? clamp01((260 - brightness) / 15)
        : 1;

  const motionSignal = samples.map((sample) => sample.signal);
  const deltas = motionSignal.slice(1).map((value, index) => Math.abs(value - motionSignal[index]));
  const motionStability = clamp01(1 - std(deltas) / 22);

  const quality = clamp01(redCoverage * 0.52 + brightnessScore * 0.2 + motionStability * 0.28);

  if (redCoverage < 0.55) return { quality, failureReason: "finger_not_detected" };
  if (brightnessScore < 0.5) return { quality, failureReason: "insufficient_light" };
  if (motionStability < 0.45) return { quality, failureReason: "high_motion" };
  if (quality < 0.45) return { quality, failureReason: "unstable_signal" };

  return { quality };
}

async function enableTorch(track: MediaStreamTrack): Promise<void> {
  try {
    const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
    if (!capabilities?.torch) return;
    await track.applyConstraints({
      advanced: [{ torch: true } as unknown as MediaTrackConstraintSet],
    });
  } catch {
    /* torch is optional */
  }
}

export async function runPulseScan(options: ScanOptions = {}): Promise<PulseScanResult> {
  const durationMs = options.durationMs ?? 35000;

  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return buildFailure("unsupported", "camera_unavailable", 0);
  }

  if (options.signal?.aborted) {
    return buildFailure("canceled", "canceled", 0);
  }

  const startedAt = Date.now();
  let stream: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 },
      },
      audio: false,
    });

    const track = stream.getVideoTracks()[0];
    if (!track) {
      return buildFailure("unsupported", "camera_unavailable", Date.now() - startedAt);
    }

    await enableTorch(track);

    const view = document.createElement("video");
    video = view;
    view.srcObject = stream;
    view.muted = true;
    view.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("video_error"));
      };
      const cleanup = () => {
        view.removeEventListener("loadedmetadata", onLoaded);
        view.removeEventListener("error", onError);
      };

      view.addEventListener("loadedmetadata", onLoaded);
      view.addEventListener("error", onError);
    });

    await view.play();
    const videoEl = view;

    const canvas = document.createElement("canvas");
    canvas.width = 72;
    canvas.height = 72;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return buildFailure("unsupported", "camera_unavailable", Date.now() - startedAt);

    const samples: PulseSample[] = [];

    while (Date.now() - startedAt < durationMs) {
      if (options.signal?.aborted) {
        return buildFailure("canceled", "canceled", Date.now() - startedAt);
      }

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rgb = frameAverage(image.data);

      const redDominance = rgb.red / (rgb.green + rgb.blue + 1);
      const brightness = (rgb.red + rgb.green + rgb.blue) / 3;
      const signal = rgb.red - (rgb.green + rgb.blue) / 2;

      samples.push({
        timestamp: Date.now() - startedAt,
        signal,
        redDominance,
        brightness,
      });

      options.onProgress?.(Math.min(1, (Date.now() - startedAt) / durationMs));
      await sleep(85);
    }

    const quality = evaluateQuality(samples);
    const pulse = estimatePulse(samples);

    if (quality.failureReason || pulse.pulse == null) {
      return {
        pulse: null,
        signalQuality: Number(quality.quality.toFixed(2)),
        durationMs: Date.now() - startedAt,
        rawStatus: "low_signal",
        failureReason: quality.failureReason ?? "unstable_signal",
        confidence: Number(Math.min(quality.quality, pulse.confidence).toFixed(2)),
      };
    }

    return {
      pulse: pulse.pulse,
      signalQuality: Number(quality.quality.toFixed(2)),
      durationMs: Date.now() - startedAt,
      rawStatus: "ok",
      confidence: Number(Math.min(0.98, pulse.confidence).toFixed(2)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";

    if (message.includes("NotAllowedError") || message.includes("PermissionDeniedError")) {
      return buildFailure("permission_denied", "permission_denied", Date.now() - startedAt);
    }

    if (message.includes("NotFoundError") || message.includes("OverconstrainedError")) {
      return buildFailure("unsupported", "camera_unavailable", Date.now() - startedAt);
    }

    return buildFailure("low_signal", "unknown", Date.now() - startedAt);
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
    if (video) {
      const view = video;
      view.pause();
      view.srcObject = null;
    }
  }
}
