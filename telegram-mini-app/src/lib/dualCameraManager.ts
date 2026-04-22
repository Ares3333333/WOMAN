export type DualCameraFailureReason =
  | "permission_denied"
  | "concurrency_blocked"
  | "camera_unavailable"
  | "timeout"
  | "canceled"
  | "unknown";

export type DualCameraDiagnosticsEvent = {
  at: string;
  event: string;
  detail?: string;
};

export type DualCameraAcquireResult =
  | {
      ok: true;
      frontStream: MediaStream;
      rearStream: MediaStream;
      strategyId: string;
      diagnostics: DualCameraDiagnosticsEvent[];
    }
  | {
      ok: false;
      reason: DualCameraFailureReason;
      strategyId: string;
      diagnostics: DualCameraDiagnosticsEvent[];
    };

type AcquireOptions = {
  signal: AbortSignal;
  frontConstraints: MediaTrackConstraints;
  rearConstraints: MediaTrackConstraints;
  timeoutMs?: number;
  onDiagnostics?: (event: DualCameraDiagnosticsEvent) => void;
};

function nowIso(): string {
  return new Date().toISOString();
}

function logEvent(
  diagnostics: DualCameraDiagnosticsEvent[],
  options: AcquireOptions,
  event: string,
  detail?: string
): void {
  const item = {
    at: nowIso(),
    event,
    detail,
  };
  diagnostics.push(item);
  options.onDiagnostics?.(item);
}

function stopStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

function mapErrorToReason(error: unknown): DualCameraFailureReason {
  const name = typeof error === "object" && error && "name" in error ? String((error as { name?: unknown }).name ?? "") : "";
  const message =
    typeof error === "object" && error && "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  const token = `${name} ${message}`;

  if (/AbortError/i.test(token)) return "canceled";
  if (/NotAllowedError|PermissionDeniedError/i.test(token)) return "permission_denied";
  if (/NotReadableError|OverconstrainedError/i.test(token)) return "concurrency_blocked";
  if (/NotFoundError/i.test(token)) return "camera_unavailable";
  if (/TimeoutError|gum_timeout/i.test(token)) return "timeout";
  return "unknown";
}

async function requestCameraStream(
  role: "front" | "rear",
  constraints: MediaTrackConstraints,
  options: AcquireOptions,
  diagnostics: DualCameraDiagnosticsEvent[]
): Promise<MediaStream> {
  const timeoutMs = options.timeoutMs ?? 7000;

  if (options.signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  logEvent(diagnostics, options, `${role}_request_started`);

  return new Promise<MediaStream>((resolve, reject) => {
    let settled = false;
    let abortListener: (() => void) | null = null;

    const done = (fn: () => void) => {
      if (settled) return;
      settled = true;
      if (abortListener) {
        options.signal.removeEventListener("abort", abortListener);
      }
      window.clearTimeout(timeout);
      fn();
    };

    const timeout = window.setTimeout(() => {
      done(() => reject(new Error("gum_timeout")));
    }, timeoutMs);

    abortListener = () => {
      done(() => reject(new DOMException("Aborted", "AbortError")));
    };
    options.signal.addEventListener("abort", abortListener, { once: true });

    navigator.mediaDevices
      .getUserMedia({ video: constraints, audio: false })
      .then((stream) => {
        done(() => {
          if (options.signal.aborted) {
            stopStream(stream);
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          logEvent(diagnostics, options, `${role}_stream_created`, stream.getVideoTracks()[0]?.label ?? "unknown");
          resolve(stream);
        });
      })
      .catch((error) => {
        done(() => reject(error));
      });
  });
}

function hasLiveTrack(stream: MediaStream): boolean {
  return stream.getVideoTracks().some((track) => track.readyState === "live");
}

async function tryParallel(
  options: AcquireOptions,
  diagnostics: DualCameraDiagnosticsEvent[]
): Promise<{ front: MediaStream; rear: MediaStream }> {
  logEvent(diagnostics, options, "dual_attempt", "parallel");

  const [frontResult, rearResult] = await Promise.allSettled([
    requestCameraStream("front", options.frontConstraints, options, diagnostics),
    requestCameraStream("rear", options.rearConstraints, options, diagnostics),
  ]);

  if (frontResult.status === "fulfilled" && rearResult.status === "fulfilled") {
    if (!hasLiveTrack(frontResult.value) || !hasLiveTrack(rearResult.value)) {
      stopStream(frontResult.value);
      stopStream(rearResult.value);
      throw new Error("dual_tracks_not_live");
    }
    return { front: frontResult.value, rear: rearResult.value };
  }

  if (frontResult.status === "fulfilled") stopStream(frontResult.value);
  if (rearResult.status === "fulfilled") stopStream(rearResult.value);

  if (frontResult.status === "rejected") throw frontResult.reason;
  if (rearResult.status === "rejected") throw rearResult.reason;

  throw new Error("dual_unknown_failure");
}

async function trySequential(
  order: "rear_then_front" | "front_then_rear",
  options: AcquireOptions,
  diagnostics: DualCameraDiagnosticsEvent[]
): Promise<{ front: MediaStream; rear: MediaStream }> {
  logEvent(diagnostics, options, "dual_attempt", order);

  let front: MediaStream | null = null;
  let rear: MediaStream | null = null;

  try {
    if (order === "rear_then_front") {
      rear = await requestCameraStream("rear", options.rearConstraints, options, diagnostics);
      front = await requestCameraStream("front", options.frontConstraints, options, diagnostics);
    } else {
      front = await requestCameraStream("front", options.frontConstraints, options, diagnostics);
      rear = await requestCameraStream("rear", options.rearConstraints, options, diagnostics);
    }

    if (!front || !rear || !hasLiveTrack(front) || !hasLiveTrack(rear)) {
      throw new Error("dual_tracks_not_live");
    }

    return { front, rear };
  } catch (error) {
    stopStream(front);
    stopStream(rear);
    throw error;
  }
}

export async function acquireDualCameraStreams(options: AcquireOptions): Promise<DualCameraAcquireResult> {
  const diagnostics: DualCameraDiagnosticsEvent[] = [];

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    logEvent(diagnostics, options, "dual_unavailable", "media_devices_missing");
    return {
      ok: false,
      reason: "camera_unavailable",
      strategyId: "none",
      diagnostics,
    };
  }

  const attempts: Array<{ id: string; run: () => Promise<{ front: MediaStream; rear: MediaStream }> }> = [
    { id: "parallel", run: () => tryParallel(options, diagnostics) },
    { id: "rear_then_front", run: () => trySequential("rear_then_front", options, diagnostics) },
    { id: "front_then_rear", run: () => trySequential("front_then_rear", options, diagnostics) },
  ];

  let lastReason: DualCameraFailureReason = "unknown";
  let lastId = "none";

  for (const attempt of attempts) {
    if (options.signal.aborted) {
      return {
        ok: false,
        reason: "canceled",
        strategyId: attempt.id,
        diagnostics,
      };
    }

    lastId = attempt.id;
    try {
      const result = await attempt.run();
      logEvent(diagnostics, options, "dual_ready", attempt.id);
      return {
        ok: true,
        frontStream: result.front,
        rearStream: result.rear,
        strategyId: attempt.id,
        diagnostics,
      };
    } catch (error) {
      const reason = mapErrorToReason(error);
      lastReason = reason;
      logEvent(diagnostics, options, "dual_attempt_failed", `${attempt.id}:${reason}`);

      if (reason === "permission_denied" || reason === "canceled") {
        break;
      }
    }
  }

  return {
    ok: false,
    reason: lastReason,
    strategyId: lastId,
    diagnostics,
  };
}

export function releaseDualCameraStreams(frontStream: MediaStream | null, rearStream: MediaStream | null): void {
  stopStream(frontStream);
  stopStream(rearStream);
}
