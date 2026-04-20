export interface BreathEstimatorResult {
  stillnessScore: number | null;
  sampleCount: number;
}

export interface BreathEstimator {
  readonly supported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<BreathEstimatorResult>;
}

class NoopBreathEstimator implements BreathEstimator {
  public readonly supported = false;

  async start(): Promise<void> {
    return;
  }

  async stop(): Promise<BreathEstimatorResult> {
    return { stillnessScore: null, sampleCount: 0 };
  }
}

class FrontCameraStillnessEstimator implements BreathEstimator {
  public readonly supported = true;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private timer: number | null = null;
  private prevLuma: number | null = null;
  private deltas: number[] = [];

  async start(): Promise<void> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("camera_unavailable");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 20, max: 24 },
      },
      audio: false,
    });

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = this.stream;
    await video.play();
    this.video = video;
    this.deltas = [];
    this.prevLuma = null;

    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas_unavailable");

    this.timer = window.setInterval(() => {
      if (!this.video) return;
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = img.data;
      let sum = 0;
      const pixels = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        // luminance approximation
        sum += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      }
      const luma = sum / pixels;
      if (this.prevLuma != null) {
        this.deltas.push(Math.abs(luma - this.prevLuma));
      }
      this.prevLuma = luma;
    }, 280);
  }

  async stop(): Promise<BreathEstimatorResult> {
    if (this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }

    if (this.deltas.length === 0) {
      return { stillnessScore: null, sampleCount: 0 };
    }

    const avgDelta = this.deltas.reduce((sum, v) => sum + v, 0) / this.deltas.length;
    const stillness = Math.max(0, Math.min(1, 1 - avgDelta / 10));

    return {
      stillnessScore: Number(stillness.toFixed(2)),
      sampleCount: this.deltas.length,
    };
  }
}

export function createBreathEstimator(): BreathEstimator {
  if (typeof window === "undefined") return new NoopBreathEstimator();
  if (!navigator.mediaDevices?.getUserMedia) return new NoopBreathEstimator();
  return new FrontCameraStillnessEstimator();
}

