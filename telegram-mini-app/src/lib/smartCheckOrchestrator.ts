import { getPreferredCameras, type CameraSelection, type DualCameraProbe } from "./cameraCapabilities";
import { runPulseScan, type PulseScanState } from "./cameraPulseScan";
import { runFrontBreathScan, type FrontBreathScanResult, type FrontFrameSignal } from "./frontBreathScan";
import type { PulseScanResult } from "./biofeedback";

export type SmartCheckMode = "dual" | "staged";

export type SmartCheckRunResult = {
  probe: DualCameraProbe;
  mode: SmartCheckMode;
  usedFallback: boolean;
  front: FrontBreathScanResult;
  pulse: PulseScanResult;
  strategyId?: string;
};

type SmartCheckDurations = {
  frontDualMs: number;
  frontStagedMs: number;
  rearMs: number;
};

type DualStrategy = {
  id: string;
  frontConstraints: MediaTrackConstraints;
  rearConstraints: MediaTrackConstraints;
};

export type RunSmartCheckOptions = {
  signal: AbortSignal;
  durations?: Partial<SmartCheckDurations>;
  onProbe?: (probe: DualCameraProbe) => void;
  onMode?: (mode: SmartCheckMode) => void;
  onStage?: (stage: "probing" | "dual" | "front" | "rear") => void;
  onStrategy?: (id: string) => void;
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
  frontDualMs: 16_000,
  frontStagedMs: 14_000,
  rearMs: 20_000,
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeDurations(partial?: Partial<SmartCheckDurations>): SmartCheckDurations {
  return {
    frontDualMs: partial?.frontDualMs ?? DEFAULT_DURATIONS.frontDualMs,
    frontStagedMs: partial?.frontStagedMs ?? DEFAULT_DURATIONS.frontStagedMs,
    rearMs: partial?.rearMs ?? DEFAULT_DURATIONS.rearMs,
  };
}

function baseFrontConstraints(front: CameraSelection, lowPower = false): MediaTrackConstraints {
  return {
    ...(front.id ? { deviceId: { exact: front.id } } : { facingMode: { exact: "user" } }),
    width: { ideal: lowPower ? 320 : 420 },
    height: { ideal: lowPower ? 320 : 420 },
    frameRate: { ideal: lowPower ? 20 : 24, max: lowPower ? 24 : 30 },
  };
}

function baseRearConstraints(rear: CameraSelection, lowPower = false): MediaTrackConstraints {
  return {
    ...(rear.id ? { deviceId: { exact: rear.id } } : { facingMode: { exact: "environment" } }),
    width: { ideal: lowPower ? 480 : 640 },
    height: { ideal: lowPower ? 360 : 480 },
    frameRate: { ideal: lowPower ? 20 : 28, max: lowPower ? 24 : 30 },
  };
}

function buildDualStrategies(front: CameraSelection, rear: CameraSelection): DualStrategy[] {
  const strategies: DualStrategy[] = [
    {
      id: "dual_facing_mode",
      frontConstraints: {
        facingMode: { ideal: "user" },
        width: { ideal: 420 },
        height: { ideal: 420 },
        frameRate: { ideal: 24, max: 30 },
      },
      rearConstraints: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 28, max: 30 },
      },
    },
    {
      id: "dual_low_power",
      frontConstraints: baseFrontConstraints(front, true),
      rearConstraints: baseRearConstraints(rear, true),
    },
  ];

  if (front.id && rear.id && front.id !== rear.id) {
    strategies.splice(1, 0, {
      id: "dual_exact_ids",
      frontConstraints: baseFrontConstraints(front, false),
      rearConstraints: baseRearConstraints(rear, false),
    });
  }

  return strategies;
}

function isConcurrencyIssue(front: FrontBreathScanResult, pulse: PulseScanResult): boolean {
  const frontBlocked = front.rawStatus === "unsupported" && front.failureReason === "camera_unavailable";
  const pulseBlocked = pulse.rawStatus === "unsupported" && pulse.failureReason === "camera_unavailable";
  return frontBlocked || pulseBlocked;
}

function isPermissionIssue(front: FrontBreathScanResult, pulse: PulseScanResult): boolean {
  return front.rawStatus === "permission_denied" || pulse.rawStatus === "permission_denied";
}

function buildProbe(params: {
  front: CameraSelection;
  rear: CameraSelection;
  supported: boolean;
  reason: DualCameraProbe["reason"];
}): DualCameraProbe {
  return {
    supported: params.supported,
    reason: params.reason,
    front: params.front,
    rear: params.rear,
    checkedAt: new Date().toISOString(),
  };
}

async function runDualAttempt(
  options: RunSmartCheckOptions,
  strategy: DualStrategy,
  durations: SmartCheckDurations
): Promise<{ front: FrontBreathScanResult; pulse: PulseScanResult }> {
  const attemptAbort = new AbortController();
  const abortFromOuter = () => attemptAbort.abort();
  options.signal.addEventListener("abort", abortFromOuter, { once: true });

  options.onMode?.("dual");
  options.onStage?.("dual");
  options.onStrategy?.(strategy.id);
  options.onFrontState?.("initializing");
  options.onPulseState?.("searching");

  try {
    const frontPromise = runFrontBreathScan({
      signal: attemptAbort.signal,
      durationMs: durations.frontDualMs,
      videoConstraints: strategy.frontConstraints,
      previewVideo: options.previewVideo,
      previewOverlay: options.previewOverlay,
      onProgress: options.onFrontProgress,
      onState: (state) => options.onFrontState?.(state),
      onFrame: options.onFrontFrame,
    });

    // Staggered start reduces WebView stream-init race without giving up true parallel measurement window.
    await wait(280);

    const pulsePromise = runPulseScan({
      signal: attemptAbort.signal,
      durationMs: durations.rearMs,
      videoConstraints: strategy.rearConstraints,
      onProgress: options.onPulseProgress,
      onStateChange: options.onPulseState,
      onSignal: options.onPulseSignal,
    });

    frontPromise
      .then((front) => {
        if (front.rawStatus === "unsupported" && front.failureReason === "camera_unavailable") {
          attemptAbort.abort();
        }
      })
      .catch(() => {
        attemptAbort.abort();
      });

    pulsePromise
      .then((pulse) => {
        if (pulse.rawStatus === "unsupported" && pulse.failureReason === "camera_unavailable") {
          attemptAbort.abort();
        }
      })
      .catch(() => {
        attemptAbort.abort();
      });

    const [front, pulse] = await Promise.all([frontPromise, pulsePromise]);

    options.onFrontState?.("done");
    options.onPulseState?.(pulse.rawStatus === "ok" ? "success" : "idle");
    return { front, pulse };
  } finally {
    options.signal.removeEventListener("abort", abortFromOuter);
    if (options.signal.aborted) {
      attemptAbort.abort();
    }
  }
}

async function runStagedFallback(
  options: RunSmartCheckOptions,
  front: CameraSelection,
  rear: CameraSelection,
  durations: SmartCheckDurations
): Promise<{ front: FrontBreathScanResult; pulse: PulseScanResult }> {
  options.onMode?.("staged");
  options.onStage?.("front");
  options.onStrategy?.("staged_fallback");
  options.onFrontState?.("initializing");

  const frontResult = await runFrontBreathScan({
    signal: options.signal,
    durationMs: durations.frontStagedMs,
    videoConstraints: baseFrontConstraints(front, true),
    previewVideo: options.previewVideo,
    previewOverlay: options.previewOverlay,
    onProgress: options.onFrontProgress,
    onState: (state) => options.onFrontState?.(state),
    onFrame: options.onFrontFrame,
  });
  options.onFrontState?.("done");

  options.onStage?.("rear");
  options.onPulseState?.("searching");
  const pulseResult = await runPulseScan({
    signal: options.signal,
    durationMs: durations.rearMs,
    videoConstraints: baseRearConstraints(rear, true),
    onProgress: options.onPulseProgress,
    onStateChange: options.onPulseState,
    onSignal: options.onPulseSignal,
  });
  options.onPulseState?.(pulseResult.rawStatus === "ok" ? "success" : "idle");

  return {
    front: frontResult,
    pulse: pulseResult,
  };
}

export async function runSmartCheckOrchestrator(options: RunSmartCheckOptions): Promise<SmartCheckRunResult> {
  const durations = normalizeDurations(options.durations);
  options.onStage?.("probing");

  const preferred = await getPreferredCameras();
  const strategies = buildDualStrategies(preferred.front, preferred.rear);

  let lastDual: { front: FrontBreathScanResult; pulse: PulseScanResult; strategyId: string } | null = null;
  let concurrencyBlocked = false;

  for (const strategy of strategies) {
    if (options.signal.aborted) break;
    const dual = await runDualAttempt(options, strategy, durations);
    lastDual = {
      ...dual,
      strategyId: strategy.id,
    };

    if (isPermissionIssue(dual.front, dual.pulse)) {
      const probe = buildProbe({
        front: preferred.front,
        rear: preferred.rear,
        supported: false,
        reason: "permission_denied",
      });
      options.onProbe?.(probe);
      return {
        probe,
        mode: "dual",
        usedFallback: false,
        front: dual.front,
        pulse: dual.pulse,
        strategyId: strategy.id,
      };
    }

    if (!isConcurrencyIssue(dual.front, dual.pulse)) {
      const probe = buildProbe({
        front: preferred.front,
        rear: preferred.rear,
        supported: true,
        reason: "ok",
      });
      options.onProbe?.(probe);
      return {
        probe,
        mode: "dual",
        usedFallback: false,
        front: dual.front,
        pulse: dual.pulse,
        strategyId: strategy.id,
      };
    }

    concurrencyBlocked = true;
  }

  const fallback = await runStagedFallback(options, preferred.front, preferred.rear, durations);
  const probe = buildProbe({
    front: preferred.front,
    rear: preferred.rear,
    supported: false,
    reason: concurrencyBlocked ? "concurrency_blocked" : "unknown",
  });
  options.onProbe?.(probe);

  return {
    probe,
    mode: "staged",
    usedFallback: true,
    front: fallback.front,
    pulse: fallback.pulse,
    strategyId: lastDual?.strategyId,
  };
}
