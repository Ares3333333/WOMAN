export type CameraRole = "front" | "rear";

export type CameraSelection = {
  id: string | null;
  label: string;
  role: CameraRole;
};

export type DualCameraProbe = {
  supported: boolean;
  reason:
    | "ok"
    | "unsupported"
    | "permission_denied"
    | "rear_unavailable"
    | "front_unavailable"
    | "concurrency_blocked"
    | "unknown";
  front: CameraSelection;
  rear: CameraSelection;
  checkedAt: string;
};

const CACHE_KEY = "sora_tg_dualcam_probe_v1";

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function scoreRearLabel(label: string): number {
  const l = normalizeLabel(label);
  let score = 0;
  if (/(rear|back|environment|world|main|wide|1x)/.test(l)) score += 4;
  if (/(ultra|tele|macro|depth)/.test(l)) score -= 2;
  if (/(flash|torch)/.test(l)) score += 1;
  if (l.length === 0) score -= 1;
  return score;
}

function scoreFrontLabel(label: string): number {
  const l = normalizeLabel(label);
  let score = 0;
  if (/(front|user|face|selfie)/.test(l)) score += 4;
  if (/(rear|back|environment)/.test(l)) score -= 3;
  if (l.length === 0) score -= 1;
  return score;
}

function fallbackSelection(role: CameraRole): CameraSelection {
  return {
    id: null,
    label: role === "rear" ? "Rear camera" : "Front camera",
    role,
  };
}

function pickDevice(devices: MediaDeviceInfo[], role: CameraRole): CameraSelection {
  const candidates = devices.filter((item) => item.kind === "videoinput");
  if (candidates.length === 0) return fallbackSelection(role);

  const ranked = [...candidates]
    .map((item) => ({
      item,
      score: role === "rear" ? scoreRearLabel(item.label) : scoreFrontLabel(item.label),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0]?.item;
  if (!top) return fallbackSelection(role);

  return {
    id: top.deviceId || null,
    label: top.label || (role === "rear" ? "Rear camera" : "Front camera"),
    role,
  };
}

async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((item) => item.kind === "videoinput");
}

function parseCachedProbe(): DualCameraProbe | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DualCameraProbe;
    if (!parsed?.checkedAt) return null;

    const ts = new Date(parsed.checkedAt).getTime();
    if (!Number.isFinite(ts)) return null;

    // cache for 12 hours; device/webview behavior can change between launches.
    if (Date.now() - ts > 12 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedProbe(probe: DualCameraProbe): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(probe));
  } catch {
    /* ignore */
  }
}

function withExactOrFacing(selection: CameraSelection, role: CameraRole): MediaTrackConstraints {
  if (selection.id) {
    return {
      deviceId: { exact: selection.id },
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 24, max: 30 },
    };
  }

  return {
    facingMode: { ideal: role === "rear" ? "environment" : "user" },
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24, max: 30 },
  };
}

export async function probeDualCameraSupport(force = false): Promise<DualCameraProbe> {
  if (!force) {
    const cached = parseCachedProbe();
    if (cached) return cached;
  }

  const checkedAt = new Date().toISOString();

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      supported: false,
      reason: "unsupported",
      front: fallbackSelection("front"),
      rear: fallbackSelection("rear"),
      checkedAt,
    };
  }

  let frontStream: MediaStream | null = null;
  let rearStream: MediaStream | null = null;

  try {
    const devicesBefore = await listVideoDevices();
    const front = pickDevice(devicesBefore, "front");

    frontStream = await navigator.mediaDevices.getUserMedia({
      video: withExactOrFacing(front, "front"),
      audio: false,
    });

    const devicesAfterFront = await listVideoDevices();
    const updatedRear = pickDevice(devicesAfterFront, "rear");

    rearStream = await navigator.mediaDevices.getUserMedia({
      video: withExactOrFacing(updatedRear, "rear"),
      audio: false,
    });

    const ok = Boolean(frontStream.getVideoTracks()[0] && rearStream.getVideoTracks()[0]);

    const probe: DualCameraProbe = {
      supported: ok,
      reason: ok ? "ok" : "concurrency_blocked",
      front,
      rear: updatedRear,
      checkedAt,
    };

    saveCachedProbe(probe);
    return probe;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const reason: DualCameraProbe["reason"] =
      /NotAllowedError|PermissionDeniedError/.test(message)
        ? "permission_denied"
        : /NotFoundError/.test(message)
          ? "rear_unavailable"
          : /OverconstrainedError/.test(message)
            ? "concurrency_blocked"
            : "unknown";

    const devices = await listVideoDevices().catch(() => []);
    const probe: DualCameraProbe = {
      supported: false,
      reason,
      front: pickDevice(devices, "front"),
      rear: pickDevice(devices, "rear"),
      checkedAt,
    };

    saveCachedProbe(probe);
    return probe;
  } finally {
    frontStream?.getTracks().forEach((track) => track.stop());
    rearStream?.getTracks().forEach((track) => track.stop());
  }
}
