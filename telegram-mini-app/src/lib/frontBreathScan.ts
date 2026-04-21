export type FrontBreathRawStatus = "ok" | "low_signal" | "permission_denied" | "unsupported" | "canceled";

export type FrontBreathScanResult = {
  breathingRate: number | null;
  regularity: number | null;
  signalQuality: number;
  confidence: number;
  stateLabel: "calm" | "neutral" | "activated" | "tense";
  motionScore: number;
  durationMs: number;
  rawStatus: FrontBreathRawStatus;
  failureReason?: "face_unstable" | "insufficient_light" | "high_motion" | "no_signal" | "permission_denied" | "camera_unavailable" | "canceled" | "unknown";
  deviceLabel?: string;
};

export type FrontBreathScanOptions = {
  durationMs?: number;
  signal?: AbortSignal;
  onProgress?: (value: number) => void;
  onState?: (state: "initializing" | "tracking" | "analyzing") => void;
  deviceId?: string | null;
};

type Sample = { t: number; value: number; brightness: number; motion: number };

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(avg(values.map((v) => (v - m) ** 2)));
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function smooth(values: number[], window = 6): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    return avg(values.slice(start, i + 1));
  });
}

function detrend(values: number[]): number[] {
  const long = smooth(values, 20);
  return values.map((v, i) => v - long[i]);
}

function estimateBreaths(samples: Sample[]): { breathingRate: number | null; regularity: number | null } {
  if (samples.length < 40) return { breathingRate: null, regularity: null };

  const signal = detrend(smooth(samples.map((s) => s.value), 4));
  const threshold = avg(signal) + std(signal) * 0.25;
  const peaks: number[] = [];

  for (let i = 2; i < signal.length - 2; i += 1) {
    const current = signal[i];
    if (
      current > threshold &&
      current >= signal[i - 1] &&
      current >= signal[i + 1] &&
      current > signal[i - 2] &&
      current > signal[i + 2]
    ) {
      const t = samples[i].t;
      const last = peaks[peaks.length - 1];
      if (!last || t - last >= 1200) {
        peaks.push(t);
      }
    }
  }

  if (peaks.length < 3) return { breathingRate: null, regularity: null };

  const intervals = peaks.slice(1).map((t, i) => t - peaks[i]).filter((d) => d >= 1200 && d <= 8000);
  if (intervals.length < 2) return { breathingRate: null, regularity: null };

  const mean = avg(intervals);
  const rate = Math.round(60000 / mean);
  const variation = std(intervals) / Math.max(1, mean);
  const regularity = Number(clamp(1 - variation * 2.2).toFixed(2));

  if (rate < 5 || rate > 34) return { breathingRate: null, regularity };

  return {
    breathingRate: rate,
    regularity,
  };
}

function classifyState(rate: number | null, regularity: number | null, motionScore: number): FrontBreathScanResult["stateLabel"] {
  if (rate == null) return motionScore > 0.65 ? "activated" : "neutral";
  if (rate <= 10 && (regularity ?? 0.4) > 0.55) return "calm";
  if (rate >= 20 || motionScore > 0.72) return "activated";
  if ((regularity ?? 0.5) < 0.35) return "tense";
  return "neutral";
}

export async function runFrontBreathScan(options: FrontBreathScanOptions = {}): Promise<FrontBreathScanResult> {
  const durationMs = options.durationMs ?? 22000;

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      breathingRate: null,
      regularity: null,
      signalQuality: 0,
      confidence: 0,
      stateLabel: "neutral",
      motionScore: 0,
      durationMs: 0,
      rawStatus: "unsupported",
      failureReason: "camera_unavailable",
    };
  }

  if (options.signal?.aborted) {
    return {
      breathingRate: null,
      regularity: null,
      signalQuality: 0,
      confidence: 0,
      stateLabel: "neutral",
      motionScore: 0,
      durationMs: 0,
      rawStatus: "canceled",
      failureReason: "canceled",
    };
  }

  const started = Date.now();
  let stream: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;

  try {
    options.onState?.("initializing");

    stream = await navigator.mediaDevices.getUserMedia({
      video: options.deviceId
        ? {
            deviceId: { exact: options.deviceId },
            width: { ideal: 360 },
            height: { ideal: 360 },
            frameRate: { ideal: 24, max: 30 },
          }
        : {
            facingMode: { ideal: "user" },
            width: { ideal: 360 },
            height: { ideal: 360 },
            frameRate: { ideal: 24, max: 30 },
          },
      audio: false,
    });

    const deviceLabel = stream.getVideoTracks()[0]?.label || undefined;

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

    const canvas = document.createElement("canvas");
    canvas.width = 72;
    canvas.height = 72;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas_unavailable");

    options.onState?.("tracking");
    const samples: Sample[] = [];

    let prevLuma: number | null = null;

    while (Date.now() - started < durationMs) {
      if (options.signal?.aborted) {
        return {
          breathingRate: null,
          regularity: null,
          signalQuality: 0,
          confidence: 0,
          stateLabel: "neutral",
          motionScore: 0,
          durationMs: Date.now() - started,
          rawStatus: "canceled",
          failureReason: "canceled",
        };
      }

      ctx.drawImage(view, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let luma = 0;
      for (let i = 0; i < image.data.length; i += 4) {
        luma += image.data[i] * 0.2126 + image.data[i + 1] * 0.7152 + image.data[i + 2] * 0.0722;
      }
      luma /= image.data.length / 4;

      const motion = prevLuma == null ? 0 : Math.abs(luma - prevLuma);
      prevLuma = luma;

      samples.push({
        t: Date.now() - started,
        value: luma,
        brightness: luma,
        motion,
      });

      options.onProgress?.(clamp((Date.now() - started) / durationMs));
      await sleep(120);
    }

    options.onState?.("analyzing");

    const breathing = estimateBreaths(samples);
    const brightnessValues = samples.map((s) => s.brightness);
    const motionValues = samples.map((s) => s.motion);

    const brightness = avg(brightnessValues);
    const brightnessScore = brightness < 28 ? clamp(brightness / 28) : brightness > 230 ? clamp((255 - brightness) / 25) : 1;
    const motionStd = std(motionValues);
    const motionScore = clamp(motionStd / 3.5);
    const stabilityScore = clamp(1 - motionScore * 0.9);

    const signalQuality = Number(clamp(brightnessScore * 0.45 + stabilityScore * 0.55).toFixed(2));
    const confidence = Number(
      clamp(
        0.15,
        signalQuality * (breathing.regularity != null ? 0.7 + breathing.regularity * 0.3 : 0.55),
        0.95
      ).toFixed(2)
    );

    const stateLabel = classifyState(breathing.breathingRate, breathing.regularity, motionScore);

    if (signalQuality < 0.38 || breathing.breathingRate == null) {
      return {
        breathingRate: breathing.breathingRate,
        regularity: breathing.regularity,
        signalQuality,
        confidence,
        stateLabel,
        motionScore: Number(motionScore.toFixed(2)),
        durationMs: Date.now() - started,
        rawStatus: "low_signal",
        failureReason: brightnessScore < 0.4 ? "insufficient_light" : motionScore > 0.7 ? "high_motion" : "no_signal",
        deviceLabel,
      };
    }

    return {
      breathingRate: breathing.breathingRate,
      regularity: breathing.regularity,
      signalQuality,
      confidence,
      stateLabel,
      motionScore: Number(motionScore.toFixed(2)),
      durationMs: Date.now() - started,
      rawStatus: "ok",
      deviceLabel,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const rawStatus: FrontBreathRawStatus =
      /NotAllowedError|PermissionDeniedError/.test(message)
        ? "permission_denied"
        : /NotFoundError|OverconstrainedError/.test(message)
          ? "unsupported"
          : "low_signal";

    return {
      breathingRate: null,
      regularity: null,
      signalQuality: 0,
      confidence: 0,
      stateLabel: "neutral",
      motionScore: 0,
      durationMs: Date.now() - started,
      rawStatus,
      failureReason:
        rawStatus === "permission_denied"
          ? "permission_denied"
          : rawStatus === "unsupported"
            ? "camera_unavailable"
            : "unknown",
    };
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }
}
