import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  active: boolean;
  title: string;
  subtitle: string;
  cameraOnLabel: string;
  cameraOffLabel: string;
  stateLoading: string;
  stateBlocked: string;
  stateUnavailable: string;
  stateOff: string;
  stillnessLabel: string;
  onStillnessSample?: (value: number) => void;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function CameraPresenceOverlay({
  active,
  title,
  subtitle,
  cameraOnLabel,
  cameraOffLabel,
  stateLoading,
  stateBlocked,
  stateUnavailable,
  stateOff,
  stillnessLabel,
  onStillnessSample,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevLumaRef = useRef<number | null>(null);

  const [state, setState] = useState<"off" | "loading" | "on" | "blocked" | "unsupported">("off");
  const [stillness, setStillness] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setState("off");
      setStillness(null);
      prevLumaRef.current = null;

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }

    let alive = true;

    const start = async () => {
      setState("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 360 },
            height: { ideal: 360 },
            frameRate: { ideal: 24, max: 30 },
          },
          audio: false,
        });

        if (!alive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();

        setState("on");

        if (!canvasRef.current) {
          const canvas = document.createElement("canvas");
          canvas.width = 60;
          canvas.height = 60;
          canvasRef.current = canvas;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        timerRef.current = window.setInterval(() => {
          if (!videoRef.current) return;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

          let luma = 0;
          for (let i = 0; i < image.data.length; i += 4) {
            luma += image.data[i] * 0.2126 + image.data[i + 1] * 0.7152 + image.data[i + 2] * 0.0722;
          }
          luma /= image.data.length / 4;

          if (prevLumaRef.current == null) {
            prevLumaRef.current = luma;
            return;
          }

          const delta = Math.abs(luma - prevLumaRef.current);
          prevLumaRef.current = luma;

          const movement = clamp(delta / 7);
          const nextStillness = Number(clamp(1 - movement).toFixed(2));
          setStillness(nextStillness);
          onStillnessSample?.(nextStillness);
        }, 260);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("NotAllowedError") || message.includes("PermissionDeniedError")) {
          setState("blocked");
          return;
        }
        setState("unsupported");
      }
    };

    void start();

    return () => {
      alive = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      prevLumaRef.current = null;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [active, onStillnessSample]);

  const stillnessValue = useMemo(() => {
    if (stillness == null) return "--";
    return `${Math.round(stillness * 100)}%`;
  }, [stillness]);

  return (
    <div className={`bio-camera-shell ${state === "on" ? "is-on" : ""}`}>
      <div className="bio-camera-head">
        <p className="tm-kicker tm-kicker--muted">{title}</p>
        <span className="bio-camera-state">{state === "on" ? cameraOnLabel : cameraOffLabel}</span>
      </div>

      <p className="tm-subtle">{subtitle}</p>

      <div className="bio-camera-stage" aria-live="polite">
        <video ref={videoRef} className="bio-camera-video" />
        <div className="bio-camera-grid" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="bio-camera-mask" aria-hidden />

        {state !== "on" ? (
          <p className="bio-camera-overlay-text">
            {state === "loading"
              ? stateLoading
              : state === "blocked"
                ? stateBlocked
                : state === "unsupported"
                  ? stateUnavailable
                  : stateOff}
          </p>
        ) : null}
      </div>

      <div className="bio-camera-meter">
        <span>{stillnessLabel}</span>
        <strong>{stillnessValue}</strong>
      </div>
    </div>
  );
}
