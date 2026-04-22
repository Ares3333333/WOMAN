type LandmarkPoint = { x: number; y: number; z?: number };
type FaceLandmarkerResult = { faceLandmarks?: LandmarkPoint[][] };
type FaceLandmarkerLike = { detectForVideo: (video: HTMLVideoElement, timestampMs: number) => FaceLandmarkerResult };

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
  failureReason?:
    | "face_unstable"
    | "insufficient_light"
    | "high_motion"
    | "no_signal"
    | "permission_denied"
    | "camera_unavailable"
    | "canceled"
    | "unknown";
  deviceLabel?: string;
  trackingMode: "mesh" | "fallback";
};

export type FrontFrameSignal = {
  signalQuality: number;
  confidence: number;
  motion: number;
  trackingMode: "mesh" | "fallback";
  landmarksDetected: boolean;
};

export type FrontBreathScanOptions = {
  durationMs?: number;
  signal?: AbortSignal;
  onProgress?: (value: number) => void;
  onState?: (state: "initializing" | "tracking" | "analyzing") => void;
  deviceId?: string | null;
  inputStream?: MediaStream | null;
  manageInputStream?: boolean;
  previewVideo?: HTMLVideoElement | null;
  previewOverlay?: HTMLCanvasElement | null;
  onFrame?: (frame: FrontFrameSignal) => void;
  onLifecycle?: (event: string, detail?: string) => void;
  videoConstraints?: MediaTrackConstraints;
};

type SignalSample = { t: number; value: number };

const DRAW_INDICES = [1, 10, 13, 14, 33, 61, 78, 93, 133, 152, 234, 263, 291, 308, 323, 356];
const MEDIA_PIPE_WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MEDIA_PIPE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

let faceLandmarkerPromise: Promise<FaceLandmarkerLike | null> | null = null;

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(avg(values.map((v) => (v - m) ** 2)));
}

function smooth(values: number[], window = 6): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    return avg(values.slice(start, i + 1));
  });
}

function detrend(values: number[]): number[] {
  const long = smooth(values, 22);
  return values.map((value, index) => value - long[index]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUserMediaWithTimeout(
  constraints: MediaStreamConstraints,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<MediaStream> {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return new Promise<MediaStream>((resolve, reject) => {
    let settled = false;

    const done = (handler: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
      handler();
    };

    const timeout = window.setTimeout(() => {
      done(() => reject(new Error("gum_timeout")));
    }, timeoutMs);

    const onAbort = () => {
      done(() => reject(new DOMException("Aborted", "AbortError")));
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        done(() => {
          if (signal?.aborted) {
            stream.getTracks().forEach((track) => track.stop());
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          resolve(stream);
        });
      })
      .catch((error) => {
        done(() => reject(error));
      });
  });
}

function computeBrightnessScore(brightness: number): number {
  if (brightness < 25) return clamp(brightness / 25);
  if (brightness > 235) return clamp((255 - brightness) / 20);
  return 1;
}

export function estimateBreathingFromSignal(samples: SignalSample[]): { breathingRate: number | null; regularity: number | null } {
  if (samples.length < 34) return { breathingRate: null, regularity: null };

  const signal = detrend(smooth(samples.map((item) => item.value), 4));
  const threshold = avg(signal) + std(signal) * 0.22;
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
      if (!last || t - last >= 1300) peaks.push(t);
    }
  }

  if (peaks.length < 3) return { breathingRate: null, regularity: null };

  const intervals = peaks
    .slice(1)
    .map((t, i) => t - peaks[i])
    .filter((value) => value >= 1200 && value <= 8500);
  if (intervals.length < 2) return { breathingRate: null, regularity: null };

  const mean = avg(intervals);
  const rate = Math.round(60000 / Math.max(1, mean));
  const variation = std(intervals) / Math.max(1, mean);
  const regularity = Number(clamp(1 - variation * 2.3).toFixed(2));

  if (rate < 5 || rate > 34) return { breathingRate: null, regularity };

  return {
    breathingRate: rate,
    regularity,
  };
}

function classifyState(rate: number | null, regularity: number | null, motionScore: number): FrontBreathScanResult["stateLabel"] {
  if (rate == null) return motionScore > 0.63 ? "activated" : "neutral";
  if (rate <= 10 && (regularity ?? 0.45) >= 0.58) return "calm";
  if (rate >= 20 || motionScore > 0.7) return "activated";
  if ((regularity ?? 0.5) < 0.36) return "tense";
  return "neutral";
}

function drawLandmarks(
  overlay: HTMLCanvasElement | null,
  landmarks: LandmarkPoint[] | null,
  size: { width: number; height: number }
): void {
  if (!overlay) return;
  if (overlay.width !== size.width || overlay.height !== size.height) {
    overlay.width = size.width;
    overlay.height = size.height;
  }

  const ctx = overlay.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  if (!landmarks) return;
  ctx.fillStyle = "rgba(212, 178, 123, 0.88)";
  ctx.strokeStyle = "rgba(212, 178, 123, 0.35)";
  ctx.lineWidth = 1;

  for (const idx of DRAW_INDICES) {
    const point = landmarks[idx];
    if (!point) continue;
    const x = point.x * overlay.width;
    const y = point.y * overlay.height;
    ctx.beginPath();
    ctx.arc(x, y, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];
  if (leftEye && rightEye && nose) {
    ctx.beginPath();
    ctx.moveTo(leftEye.x * overlay.width, leftEye.y * overlay.height);
    ctx.lineTo(nose.x * overlay.width, nose.y * overlay.height);
    ctx.lineTo(rightEye.x * overlay.width, rightEye.y * overlay.height);
    ctx.stroke();
  }
}

async function loadFaceLandmarker(): Promise<FaceLandmarkerLike | null> {
  if (faceLandmarkerPromise) return faceLandmarkerPromise;

  faceLandmarkerPromise = (async () => {
    try {
      const visionPromise = import("@mediapipe/tasks-vision");
      const timeoutPromise = new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 3800);
      });
      const maybeVision = await Promise.race([visionPromise as Promise<unknown>, timeoutPromise]);
      if (!maybeVision || typeof maybeVision !== "object") return null;
      const vision = maybeVision as typeof import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(MEDIA_PIPE_WASM_BASE);
      const landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MEDIA_PIPE_MODEL,
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      return landmarker as unknown as FaceLandmarkerLike;
    } catch {
      return null;
    }
  })();

  return faceLandmarkerPromise;
}

function frameAverageLuma(data: Uint8ClampedArray): number {
  let luma = 0;
  for (let i = 0; i < data.length; i += 4) {
    luma += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
  }
  return luma / (data.length / 4);
}

function mapErrorToStatus(error: unknown): { status: FrontBreathRawStatus; reason: FrontBreathScanResult["failureReason"] } {
  const name = typeof error === "object" && error && "name" in error ? String((error as { name?: unknown }).name ?? "") : "";
  const message =
    typeof error === "object" && error && "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  const token = `${name} ${message}`;

  if (/AbortError/i.test(token)) {
    return { status: "canceled", reason: "canceled" };
  }
  if (/NotAllowedError|PermissionDeniedError/i.test(token)) {
    return { status: "permission_denied", reason: "permission_denied" };
  }
  if (/NotFoundError|OverconstrainedError|NotReadableError/i.test(token)) {
    return { status: "unsupported", reason: "camera_unavailable" };
  }
  if (/gum_timeout|TimeoutError/i.test(token)) {
    return { status: "unsupported", reason: "camera_unavailable" };
  }
  return { status: "low_signal", reason: "unknown" };
}

export async function runFrontBreathScan(options: FrontBreathScanOptions = {}): Promise<FrontBreathScanResult> {
  const durationMs = options.durationMs ?? 22000;
  const ownStream = options.manageInputStream ?? true;

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
      trackingMode: "fallback",
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
      trackingMode: "fallback",
    };
  }

  const startedAt = Date.now();
  let stream: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;

  try {
    options.onState?.("initializing");

    stream =
      options.inputStream ??
      (await getUserMediaWithTimeout(
        {
          video: options.videoConstraints
            ? options.videoConstraints
            : options.deviceId
              ? {
                  deviceId: { exact: options.deviceId },
                  width: { ideal: 420 },
                  height: { ideal: 420 },
                  frameRate: { ideal: 24, max: 30 },
                }
              : {
                  facingMode: { ideal: "user" },
                  width: { ideal: 420 },
                  height: { ideal: 420 },
                  frameRate: { ideal: 24, max: 30 },
                },
          audio: false,
        },
        7_000,
        options.signal
      ));

    const deviceLabel = stream.getVideoTracks()[0]?.label || undefined;

    const view = options.previewVideo ?? document.createElement("video");
    video = view;
    view.srcObject = stream;
    options.onLifecycle?.("front_video_attached", stream.getVideoTracks()[0]?.label || "unknown");
    view.muted = true;
    view.playsInline = true;
    view.autoplay = true;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("video_timeout"));
      }, 4500);

      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };

      const onLoaded = () => {
        cleanup();
        options.onLifecycle?.("front_video_metadata_loaded", `${view.videoWidth}x${view.videoHeight}`);
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("video_error"));
      };
      const cleanup = () => {
        window.clearTimeout(timeout);
        view.removeEventListener("loadedmetadata", onLoaded);
        view.removeEventListener("error", onError);
        options.signal?.removeEventListener("abort", onAbort);
      };
      view.addEventListener("loadedmetadata", onLoaded);
      view.addEventListener("error", onError);
      options.signal?.addEventListener("abort", onAbort, { once: true });
    });

    await view.play();
    options.onLifecycle?.("front_play_started");

    const landmarker = await loadFaceLandmarker();
    const trackingMode: FrontBreathScanResult["trackingMode"] = landmarker ? "mesh" : "fallback";

    const processCanvas = document.createElement("canvas");
    processCanvas.width = 96;
    processCanvas.height = 96;
    const processCtx = processCanvas.getContext("2d", { willReadFrequently: true });
    if (!processCtx) throw new Error("canvas_unavailable");

    options.onState?.("tracking");
    options.onLifecycle?.("front_processing_started", trackingMode);

    const signalSamples: SignalSample[] = [];
    const brightnessSamples: number[] = [];
    const motionSamples: number[] = [];
    let landmarksSeen = 0;
    let iterations = 0;
    let fallbackPrevLuma: number | null = null;
    let previousCenter: { x: number; y: number; scale: number } | null = null;

    while (Date.now() - startedAt < durationMs) {
      if (options.signal?.aborted) {
        drawLandmarks(options.previewOverlay ?? null, null, {
          width: view.videoWidth || 180,
          height: view.videoHeight || 180,
        });

        return {
          breathingRate: null,
          regularity: null,
          signalQuality: 0,
          confidence: 0,
          stateLabel: "neutral",
          motionScore: 0,
          durationMs: Date.now() - startedAt,
          rawStatus: "canceled",
          failureReason: "canceled",
          trackingMode,
        };
      }

      iterations += 1;
      processCtx.drawImage(view, 0, 0, processCanvas.width, processCanvas.height);
      const image = processCtx.getImageData(0, 0, processCanvas.width, processCanvas.height);
      const luma = frameAverageLuma(image.data);
      brightnessSamples.push(luma);

      let motion = 0;
      let landmarksDetected = false;

      if (landmarker) {
        const result = landmarker.detectForVideo(view, performance.now());
        const landmarks = result.faceLandmarks?.[0] ?? null;

        drawLandmarks(options.previewOverlay ?? null, landmarks, {
          width: view.videoWidth || 180,
          height: view.videoHeight || 180,
        });

        if (landmarks) {
          landmarksSeen += 1;
          landmarksDetected = true;

          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const nose = landmarks[1];
          const chin = landmarks[152];

          if (leftEye && rightEye && nose && chin) {
            const eyeDist = Math.max(0.01, Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y));
            const centerX = (leftEye.x + rightEye.x + nose.x) / 3;
            const centerY = (leftEye.y + rightEye.y + chin.y) / 3;
            const breathSignal = (chin.y - nose.y) / eyeDist;

            if (previousCenter) {
              motion = Math.hypot(centerX - previousCenter.x, centerY - previousCenter.y) / Math.max(0.01, previousCenter.scale);
            }
            previousCenter = { x: centerX, y: centerY, scale: eyeDist };

            signalSamples.push({ t: Date.now() - startedAt, value: breathSignal });
            motionSamples.push(motion);
          }
        }
      } else {
        if (fallbackPrevLuma != null) {
          motion = Math.abs(luma - fallbackPrevLuma) / 10;
          signalSamples.push({ t: Date.now() - startedAt, value: luma });
          motionSamples.push(motion);
        }
        fallbackPrevLuma = luma;
      }

      const progress = clamp((Date.now() - startedAt) / durationMs);
      options.onProgress?.(progress);

      const avgMotion = clamp(avg(motionSamples) * 5);
      const brightnessScore = computeBrightnessScore(avg(brightnessSamples));
      const landmarkPresence = trackingMode === "mesh" ? clamp(landmarksSeen / Math.max(1, iterations)) : 0.35;
      const quality = Number(
        clamp(
          trackingMode === "mesh" ? brightnessScore * 0.2 + (1 - avgMotion) * 0.35 + landmarkPresence * 0.45 : brightnessScore * 0.45 + (1 - avgMotion) * 0.55
        ).toFixed(2)
      );
      const confidence = Number(clamp(quality * 0.92, 0.15, 0.95).toFixed(2));

      options.onFrame?.({
        signalQuality: quality,
        confidence,
        motion: Number(avgMotion.toFixed(2)),
        trackingMode,
        landmarksDetected,
      });

      await sleep(110);
    }

    options.onState?.("analyzing");

    const breathing = estimateBreathingFromSignal(signalSamples);
    const brightnessScore = computeBrightnessScore(avg(brightnessSamples));
    const avgMotion = clamp(avg(motionSamples) * 5);
    const landmarkPresence = trackingMode === "mesh" ? clamp(landmarksSeen / Math.max(1, iterations)) : 0.35;
    const signalQuality = Number(
      clamp(
        trackingMode === "mesh" ? brightnessScore * 0.2 + (1 - avgMotion) * 0.35 + landmarkPresence * 0.45 : brightnessScore * 0.45 + (1 - avgMotion) * 0.55
      ).toFixed(2)
    );
    const confidence = Number(
      clamp(
        signalQuality * (breathing.regularity != null ? 0.7 + breathing.regularity * 0.3 : 0.52),
        0.15,
        0.95
      ).toFixed(2)
    );
    const stateLabel = classifyState(breathing.breathingRate, breathing.regularity, avgMotion);

    if (signalQuality < 0.4 || breathing.breathingRate == null) {
      const failureReason: FrontBreathScanResult["failureReason"] =
        trackingMode === "mesh" && landmarkPresence < 0.22
          ? "face_unstable"
          : brightnessScore < 0.45
            ? "insufficient_light"
            : avgMotion > 0.68
              ? "high_motion"
              : "no_signal";

      return {
        breathingRate: breathing.breathingRate,
        regularity: breathing.regularity,
        signalQuality,
        confidence,
        stateLabel,
        motionScore: Number(avgMotion.toFixed(2)),
        durationMs: Date.now() - startedAt,
        rawStatus: "low_signal",
        failureReason,
        deviceLabel,
        trackingMode,
      };
    }

    return {
      breathingRate: breathing.breathingRate,
      regularity: breathing.regularity,
      signalQuality,
      confidence,
      stateLabel,
      motionScore: Number(avgMotion.toFixed(2)),
      durationMs: Date.now() - startedAt,
      rawStatus: "ok",
      deviceLabel,
      trackingMode,
    };
  } catch (error) {
    const mapped = mapErrorToStatus(error);

    return {
      breathingRate: null,
      regularity: null,
      signalQuality: 0,
      confidence: 0,
      stateLabel: "neutral",
      motionScore: 0,
      durationMs: Date.now() - startedAt,
      rawStatus: mapped.status,
      failureReason: mapped.reason,
      trackingMode: "fallback",
    };
  } finally {
    if (ownStream) {
      stream?.getTracks().forEach((track) => track.stop());
    }
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    drawLandmarks(options.previewOverlay ?? null, null, {
      width: options.previewVideo?.videoWidth || 180,
      height: options.previewVideo?.videoHeight || 180,
    });
  }
}
