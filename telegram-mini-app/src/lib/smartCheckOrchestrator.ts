import { getPreferredCameras, type CameraSelection, type DualCameraProbe } from "./cameraCapabilities";
import { runPulseScan, type PulseScanState } from "./cameraPulseScan";
import { runFrontBreathScan, type FrontBreathScanResult, type FrontFrameSignal } from "./frontBreathScan";
import type { PulseScanResult } from "./biofeedback";
import {
  acquireDualCameraStreams,
  releaseDualCameraStreams,
  type DualCameraDiagnosticsEvent,
  type DualCameraFailureReason,
} from "./dualCameraManager";

export type SmartCheckMode = "dual" | "staged";

export type SmartCheckRunResult = {
  probe: DualCameraProbe;
  mode: SmartCheckMode;
  usedFallback: boolean;
  dualRuntimeConfirmed: boolean;
  front: FrontBreathScanResult;
  pulse: PulseScanResult;
  strategyId?: string;
  diagnostics?: DualCameraDiagnosticsEvent[];
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
  onDiagnostics?: (event: DualCameraDiagnosticsEvent) => void;
  previewVideo?: HTMLVideoElement | null;
  previewOverlay?: HTMLCanvasElement | null;
};

const DEFAULT_DURATIONS: SmartCheckDurations = {
  frontDualMs: 16_000,
  frontStagedMs: 14_000,
  rearMs: 20_000,
};

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
  const strategies: DualStrategy[] = [];

  if (front.id && rear.id && front.id !== rear.id) {
    strategies.push({
      id: "dual_exact_ids",
      frontConstraints: baseFrontConstraints(front, false),
      rearConstraints: baseRearConstraints(rear, false),
    });
  }

  strategies.push(
    {
      id: "dual_facing_exact",
      frontConstraints: {
        facingMode: { exact: "user" },
        width: { ideal: 420 },
        height: { ideal: 420 },
        frameRate: { ideal: 24, max: 30 },
      },
      rearConstraints: {
        facingMode: { exact: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 28, max: 30 },
      },
    },
  );

  return strategies;
}

function isPulseReliable(pulse: PulseScanResult): boolean {
  return pulse.rawStatus === "ok" && pulse.pulse != null && pulse.signalQuality >= 0.45 && pulse.confidence >= 0.45;
}

async function runRearPriorityRescue(
  options: RunSmartCheckOptions,
  rear: CameraSelection,
  durations: SmartCheckDurations
): Promise<PulseScanResult> {
  options.onDiagnostics?.({
    at: new Date().toISOString(),
    event: "rear_rescue_started",
    detail: rear.label || "rear",
  });
  options.onPulseState?.("searching");

  const pulse = await runPulseScan({
    signal: options.signal,
    durationMs: durations.rearMs,
    videoConstraints: baseRearConstraints(rear, false),
    onProgress: options.onPulseProgress,
    onStateChange: options.onPulseState,
    onSignal: options.onPulseSignal,
    onLifecycle: (event, detail) =>
      options.onDiagnostics?.({
        at: new Date().toISOString(),
        event,
        detail,
      }),
  });

  options.onPulseState?.(pulse.rawStatus === "ok" ? "success" : "idle");
  options.onDiagnostics?.({
    at: new Date().toISOString(),
    event: "rear_rescue_finished",
    detail: pulse.rawStatus,
  });
  return pulse;
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

function emitDiagnostics(
  options: RunSmartCheckOptions,
  diagnostics: DualCameraDiagnosticsEvent[],
  event: string,
  detail?: string
): void {
  const item = {
    at: new Date().toISOString(),
    event,
    detail,
  };
  diagnostics.push(item);
  options.onDiagnostics?.(item);
}

function hasDiagEvent(diagnostics: DualCameraDiagnosticsEvent[], event: string): boolean {
  return diagnostics.some((item) => item.event === event);
}

function verifyDualRuntime(
  diagnostics: DualCameraDiagnosticsEvent[],
  pulse: PulseScanResult,
  front: FrontBreathScanResult
): boolean {
  const required = [
    "front_stream_acquired",
    "rear_stream_acquired",
    "front_video_attached",
    "rear_video_attached",
    "front_play_started",
    "rear_play_started",
    "front_processing_started",
    "rear_processing_started",
  ];

  const diagnosticsReady = required.every((event) => hasDiagEvent(diagnostics, event));
  const rearPulseOk =
    pulse.rawStatus === "ok" &&
    pulse.pulse != null &&
    (pulse.contactDetected || (pulse.contactConfidence ?? 0) >= 0.6);
  const frontAlive = front.rawStatus !== "unsupported" && front.rawStatus !== "permission_denied";
  return diagnosticsReady && rearPulseOk && frontAlive;
}

function buildFrontFailure(reason: DualCameraFailureReason): FrontBreathScanResult {
  if (reason === "permission_denied") {
    return {
      breathingRate: null,
      regularity: null,
      signalQuality: 0,
      confidence: 0,
      stateLabel: "neutral",
      motionScore: 0,
      durationMs: 0,
      rawStatus: "permission_denied",
      failureReason: "permission_denied",
      trackingMode: "fallback",
    };
  }

  if (reason === "canceled") {
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

function buildPulseFailure(reason: DualCameraFailureReason): PulseScanResult {
  if (reason === "permission_denied") {
    return {
      pulse: null,
      signalQuality: 0,
      durationMs: 0,
      rawStatus: "permission_denied",
      failureReason: "permission_denied",
      confidence: 0,
      contactDetected: false,
      contactConfidence: 0,
      torchMode: "unavailable",
      device: {
        cameraFacing: "unknown",
        torchAvailable: false,
        torchEnabled: false,
      },
    };
  }

  if (reason === "canceled") {
    return {
      pulse: null,
      signalQuality: 0,
      durationMs: 0,
      rawStatus: "canceled",
      failureReason: "canceled",
      confidence: 0,
      contactDetected: false,
      contactConfidence: 0,
      torchMode: "unavailable",
      device: {
        cameraFacing: "unknown",
        torchAvailable: false,
        torchEnabled: false,
      },
    };
  }

  return {
    pulse: null,
    signalQuality: 0,
    durationMs: 0,
    rawStatus: "unsupported",
    failureReason: "camera_unavailable",
    confidence: 0,
    contactDetected: false,
    contactConfidence: 0,
    torchMode: "unavailable",
    device: {
      cameraFacing: "unknown",
      torchAvailable: false,
      torchEnabled: false,
    },
  };
}

async function runDualAttempt(
  options: RunSmartCheckOptions,
  strategy: DualStrategy,
  durations: SmartCheckDurations
): Promise<{ front: FrontBreathScanResult; pulse: PulseScanResult; strategyId: string; diagnostics: DualCameraDiagnosticsEvent[] }> {
  options.onMode?.("dual");
  options.onStage?.("dual");
  options.onStrategy?.(strategy.id);
  const diagnostics: DualCameraDiagnosticsEvent[] = [];
  emitDiagnostics(options, diagnostics, "dual_strategy_selected", strategy.id);
  options.onFrontState?.("initializing");
  options.onPulseState?.("searching");

  const opened = await acquireDualCameraStreams({
    signal: options.signal,
    frontConstraints: strategy.frontConstraints,
    rearConstraints: strategy.rearConstraints,
    timeoutMs: 20_000,
    onDiagnostics: (item) => {
      diagnostics.push(item);
      options.onDiagnostics?.(item);
    },
  });

  const strategyId = `${strategy.id}:${opened.strategyId}`;
  options.onStrategy?.(strategyId);

  if (!opened.ok) {
    options.onFrontState?.("done");
    options.onPulseState?.("idle");
    return {
      front: buildFrontFailure(opened.reason),
      pulse: buildPulseFailure(opened.reason),
      strategyId,
      diagnostics,
    };
  }

  const frontStream = opened.frontStream;
  const rearStream = opened.rearStream;

  try {
    const [front, pulse] = await Promise.all([
      runFrontBreathScan({
        signal: options.signal,
        durationMs: durations.frontDualMs,
        inputStream: frontStream,
        manageInputStream: false,
        previewVideo: options.previewVideo,
        previewOverlay: options.previewOverlay,
        onProgress: options.onFrontProgress,
        onState: (state) => options.onFrontState?.(state),
        onFrame: options.onFrontFrame,
        onLifecycle: (event, detail) =>
          emitDiagnostics(options, diagnostics, event, detail),
      }),
      runPulseScan({
        signal: options.signal,
        durationMs: durations.rearMs,
        inputStream: rearStream,
        manageInputStream: false,
        onProgress: options.onPulseProgress,
        onStateChange: options.onPulseState,
        onSignal: options.onPulseSignal,
        onLifecycle: (event, detail) =>
          emitDiagnostics(options, diagnostics, event, detail),
      }),
    ]);

    options.onFrontState?.("done");
    options.onPulseState?.(pulse.rawStatus === "ok" ? "success" : "idle");
    return {
      front,
      pulse,
      strategyId,
      diagnostics,
    };
  } finally {
    releaseDualCameraStreams(frontStream, rearStream);
  }
}

async function runStagedFallback(
  options: RunSmartCheckOptions,
  front: CameraSelection,
  rear: CameraSelection,
  durations: SmartCheckDurations
): Promise<{ front: FrontBreathScanResult; pulse: PulseScanResult }> {
  options.onMode?.("staged");
  options.onStage?.("rear");
  options.onStrategy?.("staged_fallback");
  options.onPulseState?.("searching");
  let pulseResult = await runPulseScan({
    signal: options.signal,
    durationMs: durations.rearMs,
    videoConstraints: baseRearConstraints(rear, false),
    onProgress: options.onPulseProgress,
    onStateChange: options.onPulseState,
    onSignal: options.onPulseSignal,
    onLifecycle: (event, detail) =>
      options.onDiagnostics?.({
        at: new Date().toISOString(),
        event,
        detail,
      }),
  });
  options.onPulseState?.(pulseResult.rawStatus === "ok" ? "success" : "idle");

  if (!isPulseReliable(pulseResult) && !options.signal.aborted) {
    pulseResult = await runRearPriorityRescue(options, rear, durations);
  }

  options.onStage?.("front");
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
    onLifecycle: (event, detail) =>
      options.onDiagnostics?.({
        at: new Date().toISOString(),
        event,
        detail,
      }),
  });
  options.onFrontState?.("done");

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

  let lastDual:
    | { front: FrontBreathScanResult; pulse: PulseScanResult; strategyId: string; diagnostics: DualCameraDiagnosticsEvent[] }
    | null = null;
  let concurrencyBlocked = false;

  for (const strategy of strategies) {
    if (options.signal.aborted) break;
    const dual = await runDualAttempt(options, strategy, durations);
    let bestDual = dual;

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
        dualRuntimeConfirmed: false,
        front: dual.front,
        pulse: dual.pulse,
        strategyId: dual.strategyId,
        diagnostics: dual.diagnostics,
      };
    }

    if (!isConcurrencyIssue(dual.front, dual.pulse) && !isPulseReliable(bestDual.pulse) && !options.signal.aborted) {
      const rescuedPulse = await runRearPriorityRescue(options, preferred.rear, durations);
      bestDual = {
        ...bestDual,
        pulse: rescuedPulse,
      };
    }

    lastDual = bestDual;

    const dualRuntimeConfirmed = verifyDualRuntime(bestDual.diagnostics ?? [], bestDual.pulse, bestDual.front);
    if (!dualRuntimeConfirmed) {
      concurrencyBlocked = true;
      emitDiagnostics(options, bestDual.diagnostics ?? [], "dual_runtime_unconfirmed", bestDual.strategyId);
      continue;
    }

    if (!isConcurrencyIssue(bestDual.front, bestDual.pulse)) {
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
        dualRuntimeConfirmed,
        front: bestDual.front,
        pulse: bestDual.pulse,
        strategyId: bestDual.strategyId,
        diagnostics: bestDual.diagnostics,
      };
    }

    concurrencyBlocked = true;
  }

  const fallback = await runStagedFallback(options, preferred.front, preferred.rear, durations);
  options.onDiagnostics?.({
    at: new Date().toISOString(),
    event: "fallback_triggered",
    detail: concurrencyBlocked ? "concurrency_blocked" : "unknown",
  });
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
    dualRuntimeConfirmed: false,
    front: fallback.front,
    pulse: fallback.pulse,
    strategyId: lastDual?.strategyId,
    diagnostics: lastDual?.diagnostics,
  };
}
