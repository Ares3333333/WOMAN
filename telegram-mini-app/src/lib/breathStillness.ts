export type StillnessResult = {
  stillnessScore: number | null;
  sampleCount: number;
};

export type StillnessMonitor = {
  supported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<StillnessResult>;
};

class NoopStillnessMonitor implements StillnessMonitor {
  supported = false;

  async start(): Promise<void> {
    return;
  }

  async stop(): Promise<StillnessResult> {
    return { stillnessScore: null, sampleCount: 0 };
  }
}

class CameraStillnessMonitor implements StillnessMonitor {
  supported = true;

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
        frameRate: { ideal: 18, max: 24 },
      },
      audio: false,
    });

    const video = document.createElement("video");
    video.srcObject = this.stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();

    this.video = video;
    this.prevLuma = null;
    this.deltas = [];

    const canvas = document.createElement("canvas");
    canvas.width = 44;
    canvas.height = 44;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas_unavailable");

    this.timer = window.setInterval(() => {
      if (!this.video) return;
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;

      let sum = 0;
      const pixels = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      }
      const luma = sum / pixels;

      if (this.prevLuma != null) {
        this.deltas.push(Math.abs(luma - this.prevLuma));
      }
      this.prevLuma = luma;
    }, 300);
  }

  async stop(): Promise<StillnessResult> {
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

    const avgDelta = this.deltas.reduce((sum, value) => sum + value, 0) / this.deltas.length;
    const stillness = Math.max(0, Math.min(1, 1 - avgDelta / 10));

    return {
      stillnessScore: Number(stillness.toFixed(2)),
      sampleCount: this.deltas.length,
    };
  }
}

export function createStillnessMonitor(): StillnessMonitor {
  if (typeof window === "undefined") return new NoopStillnessMonitor();
  if (!navigator.mediaDevices?.getUserMedia) return new NoopStillnessMonitor();
  return new CameraStillnessMonitor();
}
