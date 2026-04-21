export type BreathAudioSummary = {
  breathRate: number | null;
  rhythmStability: number | null;
  confidence: number;
  recordingMs: number;
  sampleCount: number;
  guidance: "excellent" | "good" | "improving" | "irregular" | "insufficient";
  rawStatus: "ok" | "permission_denied" | "unsupported" | "canceled" | "no_signal";
};

export type BreathAudioCapture = {
  status: "recording" | "unsupported" | "permission_denied";
  stop: () => Promise<BreathAudioSummary>;
};

type EnvelopeSample = { t: number; rms: number };

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(avg(values.map((v) => (v - m) ** 2)));
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function smooth(values: number[], window = 5): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    return avg(values.slice(start, i + 1));
  });
}

function analyzeEnvelope(samples: EnvelopeSample[]): Omit<BreathAudioSummary, "recordingMs" | "rawStatus"> {
  if (samples.length < 20) {
    return {
      breathRate: null,
      rhythmStability: null,
      confidence: 0.15,
      sampleCount: samples.length,
      guidance: "insufficient",
    };
  }

  const envelope = smooth(samples.map((s) => s.rms), 4);
  const baseline = smooth(envelope, 16);
  const signal = envelope.map((v, i) => v - baseline[i]);

  const threshold = avg(signal) + std(signal) * 0.18;
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
      if (!last || t - last >= 1000) {
        peaks.push(t);
      }
    }
  }

  if (peaks.length < 3) {
    return {
      breathRate: null,
      rhythmStability: null,
      confidence: 0.2,
      sampleCount: samples.length,
      guidance: "insufficient",
    };
  }

  const intervals = peaks.slice(1).map((t, i) => t - peaks[i]).filter((d) => d >= 1000 && d <= 9000);
  if (intervals.length < 2) {
    return {
      breathRate: null,
      rhythmStability: null,
      confidence: 0.2,
      sampleCount: samples.length,
      guidance: "insufficient",
    };
  }

  const meanInterval = avg(intervals);
  const breathRate = Math.round(60000 / meanInterval);

  const cv = std(intervals) / Math.max(1, meanInterval);
  const rhythmStability = Number(clamp(1 - cv * 2.4).toFixed(2));

  const signalPower = std(signal);
  const confidence = Number(clamp(0.2, 0.35 + rhythmStability * 0.45 + clamp(signalPower / 0.03) * 0.2, 0.95).toFixed(2));

  let guidance: BreathAudioSummary["guidance"] = "improving";
  if (breathRate >= 8 && breathRate <= 13 && rhythmStability >= 0.68) guidance = "excellent";
  else if (breathRate >= 8 && breathRate <= 16 && rhythmStability >= 0.52) guidance = "good";
  else if (breathRate > 20 || rhythmStability < 0.3) guidance = "irregular";

  return {
    breathRate,
    rhythmStability,
    confidence,
    sampleCount: samples.length,
    guidance,
  };
}

export async function startBreathAudioCapture(): Promise<BreathAudioCapture> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
    return {
      status: "unsupported",
      stop: async () => ({
        breathRate: null,
        rhythmStability: null,
        confidence: 0,
        recordingMs: 0,
        sampleCount: 0,
        guidance: "insufficient",
        rawStatus: "unsupported",
      }),
    };
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status: BreathAudioSummary["rawStatus"] = /NotAllowedError|PermissionDeniedError/.test(message)
      ? "permission_denied"
      : "unsupported";

    return {
      status,
      stop: async () => ({
        breathRate: null,
        rhythmStability: null,
        confidence: 0,
        recordingMs: 0,
        sampleCount: 0,
        guidance: "insufficient",
        rawStatus: status,
      }),
    };
  }

  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const recorderChunks: BlobPart[] = [];
  let recorder: MediaRecorder | null = null;
  const canRecord = typeof MediaRecorder !== "undefined";

  if (canRecord) {
    try {
      recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recorderChunks.push(event.data);
      };
      recorder.start(1000);
    } catch {
      recorder = null;
    }
  }

  const startedAt = Date.now();
  const samples: EnvelopeSample[] = [];
  const buffer = new Float32Array(analyser.fftSize);

  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const v = buffer[i];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buffer.length);
    samples.push({
      t: Date.now() - startedAt,
      rms,
    });
  }, 220);

  return {
    status: "recording",
    stop: async () => {
      window.clearInterval(timer);

      if (recorder && recorder.state !== "inactive") {
        await new Promise<void>((resolve) => {
          recorder?.addEventListener("stop", () => resolve(), { once: true });
          recorder?.stop();
        });
      }

      source.disconnect();
      analyser.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await context.close();

      const recordingMs = Date.now() - startedAt;
      const analysis = analyzeEnvelope(samples);
      const audioBlob = recorderChunks.length > 0 ? new Blob(recorderChunks, { type: "audio/webm" }) : null;
      if (audioBlob && audioBlob.size === 0) {
        // no-op; we intentionally do not persist raw audio for privacy.
      }

      const rawStatus: BreathAudioSummary["rawStatus"] =
        analysis.breathRate == null && analysis.sampleCount < 12
          ? "no_signal"
          : "ok";

      return {
        ...analysis,
        recordingMs,
        rawStatus,
      };
    },
  };
}
