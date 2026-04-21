import { probeDualCameraSupport, type DualCameraProbe } from "./cameraCapabilities";
import { runPulseScan, type PulseScanState } from "./cameraPulseScan";
import { runFrontBreathScan, type FrontBreathScanResult, type FrontFrameSignal } from "./frontBreathScan";
import type { PulseScanResult } from "./biofeedback";

export type SmartCheckMode = "parallel" | "staged";

export type SmartCheckRunResult = {
  probe: DualCameraProbe;
  mode: SmartCheckMode;
  usedFallback: boolean;
  front: FrontBreathScanResult;
  pulse: PulseScanResult;
};

type SmartCheckDurations = {
  frontDualMs: number;
  frontStagedMs: number;
  rearMs: number;
};

export type RunSmartCheckOptions = {
  signal: AbortSignal;
  durations?: Partial<SmartCheckDurations>;
  onProbe?: (probe: DualCameraProbe) => void;
  onMode?: (mode: SmartCheckMode) => void;
  onStage?: (stage: "probing" | "dual" | "front" | "rear") => void;
  onFrontProgress?: (value: number) => void;
  onFrontState?: (state: "initializing" | "tracking" | "analyzing" | "done") => void;
  onFrontFrame?: (frame: FrontFrameSignal) => void;
  onPulseProgress?: (value: number) => void;
  onPulseState?: (state: PulseScanState | "success" | "idle") => void;
  onPulseSignal?: (value: {
    contactConfidence: number;
    contactDetected: boolean;
    redDominance: number;
    brightness: number;
    elapsedMs: number;
  }) => void;
  previewVideo?: HTMLVideoElement | null;
  previewOverlay?: HTMLCanvasElement | null;
};

const DEFAULT_DURATIONS: SmartCheckDurations = {
  frontDualMs: 18_000,
  frontStagedMs: 16_000,
  rearMs: 24_000,
};

function normalizeDurations(partial?: Partial<SmartCheckDurations>): SmartCheckDurations {
  return {
    frontDualMs: partial?.frontDualMs ?? DEFAULT_DURATIONS.frontDualMs,
    frontStagedMs: partial?.frontStagedMs ?? DEFAULT_DURATIONS.frontStagedMs,
    rearMs: partial?.rearMs ?? DEFAULT_DURATIONS.rearMs,
  };
}

function shouldRetryAsStaged(front: FrontBreathScanResult, pulse: PulseScanResult): boolean {
  const frontConcurrency = front.rawStatus === "unsupported" && front.failureReason === "camera_unavailable";
  const pulseConcurrency = pulse.rawStatus === "unsupported" && pulse.failureReason === "camera_unavailable";
  return frontConcurrency || pulseConcurrency;
}

async function runStaged(
  options: RunSmartCheckOptions,
  probe: DualCameraProbe,
  durations: SmartCheckDurations,
  forceShortFront = false
): Promise<{ front: FrontBreathScanResult; pulse: PulseScanResult }> {
  options.onMode?.("staged");
  options.onStage?.("front");
  options.onFrontState?.("initializing");
  const front = await runFrontBreathScan({
    signal: options.signal,
    durationMs: forceShortFront ? durations.frontStagedMs : durations.frontDualMs,
    deviceId: probe.front.id,
    previewVideo: options.previewVideo,
    previewOverlay: options.previewOverlay,
    onProgress: options.onFrontProgress,
    onFrame: options.onFrontFrame,
    onState: (state) => {
      options.onFrontState?.(state);
    },
  });
  options.onFrontState?.("done");

  options.onStage?.("rear");
  options.onPulseState?.("searching");
  const pulse = await runPulseScan({
    signal: options.signal,
    durationMs: durations.rearMs,
    deviceId: probe.rear.id,
    onProgress: options.onPulseProgress,
    onStateChange: options.onPulseState,
    onSignal: options.onPulseSignal,
  });
  options.onPulseState?.(pulse.rawStatus === "ok" ? "success" : "idle");

  return { front, pulse };
}

export async function runSmartCheckOrchestrator(options: RunSmartCheckOptions): Promise<SmartCheckRunResult> {
  const durations = normalizeDurations(options.durations);
  options.onStage?.("probing");
  const probe = await probeDualCameraSupport();
  options.onProbe?.(probe);

  if (!probe.supported) {
    const staged = await runStaged(options, probe, durations, true);
    return {
      probe,
      mode: "staged",
      usedFallback: true,
      front: staged.front,
      pulse: staged.pulse,
    };
  }

  options.onMode?.("parallel");
  options.onStage?.("dual");
  options.onFrontState?.("initializing");
  options.onPulseState?.("searching");

  const [front, pulse] = await Promise.all([
    runFrontBreathScan({
      signal: options.signal,
      durationMs: durations.frontDualMs,
      deviceId: probe.front.id,
      previewVideo: options.previewVideo,
      previewOverlay: options.previewOverlay,
      onProgress: options.onFrontProgress,
      onState: (state) => options.onFrontState?.(state),
      onFrame: options.onFrontFrame,
    }),
    runPulseScan({
      signal: options.signal,
      durationMs: durations.rearMs,
      deviceId: probe.rear.id,
      onProgress: options.onPulseProgress,
      onStateChange: options.onPulseState,
      onSignal: options.onPulseSignal,
    }),
  ]);
  options.onFrontState?.("done");
  options.onPulseState?.(pulse.rawStatus === "ok" ? "success" : "idle");

  if (options.signal.aborted) {
    return {
      probe,
      mode: "parallel",
      usedFallback: false,
      front,
      pulse,
    };
  }

  if (shouldRetryAsStaged(front, pulse)) {
    const staged = await runStaged(options, probe, durations, true);
    return {
      probe,
      mode: "staged",
      usedFallback: true,
      front: staged.front,
      pulse: staged.pulse,
    };
  }

  return {
    probe,
    mode: "parallel",
    usedFallback: false,
    front,
    pulse,
  };
}
