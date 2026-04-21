import type { ReactNode, RefObject } from "react";
import type { PulseScanState } from "../../lib/cameraPulseScan";

type SmartCheckPanelProps = {
  title: string;
  lead: string;
  disclaimer: string;
  probeHint: string;
  front: {
    title: string;
    status: string;
    progress: number;
    quality: string;
    confidence: string;
    motion: string;
    tracking: string;
    qualityLabel: string;
    confidenceLabel: string;
    motionLabel: string;
    trackingLabel: string;
    hint: string;
    metricLine?: string | null;
    error?: string | null;
    videoRef: RefObject<HTMLVideoElement>;
    overlayRef: RefObject<HTMLCanvasElement>;
    running: boolean;
  };
  rear: {
    title: string;
    status: string;
    progress: number;
    targetHint: string;
    rearHint: string;
    selectedCamera: string;
    coverHint: string;
    stillHint: string;
    liveHint?: string | null;
    torchHint?: string | null;
    error?: string | null;
    state: PulseScanState | "idle" | "success";
  };
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  historyAction: {
    label: string;
    onClick: () => void;
  };
  cancelAction?: {
    label: string;
    onClick: () => void;
  };
  topError?: string | null;
  children?: ReactNode;
};

export function SmartCheckPanel(props: SmartCheckPanelProps) {
  return (
    <section className="tm-card tm-card--quiet bio-card">
      <div className="bio-head">
        <p className="tm-kicker tm-kicker--muted">{props.title}</p>
        <h2 className="tm-h2">{props.lead}</h2>
        <p className="tm-subtle">{props.disclaimer}</p>
        <p className="tm-subtle">{props.probeHint}</p>
      </div>

      <div className="bio-smart-grid">
        <article className="bio-smart-item">
          <p className="tm-kicker tm-kicker--muted">{props.front.title}</p>
          <p className="tm-subtle">{props.front.status}</p>
          <div className="bio-front-pip">
            <div className="bio-front-pip-stage">
              <video ref={props.front.videoRef} className="bio-front-pip-video" playsInline muted />
              <canvas ref={props.front.overlayRef} className="bio-front-pip-overlay" />
              {!props.front.running ? <p className="bio-front-pip-hint">{props.front.hint}</p> : null}
            </div>
            <div className="bio-front-pip-meta">
              <span>
                {props.front.qualityLabel}: <strong>{props.front.quality}</strong>
              </span>
              <span>
                {props.front.confidenceLabel}: <strong>{props.front.confidence}</strong>
              </span>
              <span>
                {props.front.motionLabel}: <strong>{props.front.motion}</strong>
              </span>
              <span>
                {props.front.trackingLabel}: <strong>{props.front.tracking}</strong>
              </span>
            </div>
          </div>
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${Math.round(props.front.progress * 100)}%` }} />
          </div>
          {props.front.metricLine ? <p className="tm-subtle">{props.front.metricLine}</p> : null}
          {props.front.error ? <p className="bio-error">{props.front.error}</p> : null}
        </article>

        <article className="bio-smart-item">
          <p className="tm-kicker tm-kicker--muted">{props.rear.title}</p>
          <p className="tm-subtle">{props.rear.status}</p>
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${Math.round(props.rear.progress * 100)}%` }} />
          </div>

          <div className="bio-rear-target-row">
            <span className={`bio-rear-lens-target ${props.rear.state === "measuring" ? "is-live" : ""}`} />
            <p className="tm-subtle">{props.rear.targetHint}</p>
          </div>

          <p className="tm-subtle">{props.rear.rearHint}</p>
          <p className="tm-subtle">{props.rear.selectedCamera}</p>
          <p className="tm-subtle">{props.rear.coverHint}</p>
          {props.rear.liveHint ? <p className="tm-subtle">{props.rear.liveHint}</p> : null}

          <div className="bio-pulse-visual" aria-hidden>
            <div className="bio-phone-mock">
              <span className="bio-phone-lens" />
              <span className="bio-phone-flash" />
              <span className={`bio-phone-finger ${props.rear.state === "measuring" ? "on" : ""}`} />
            </div>
            <div className="bio-ring-wrap">
              <div className="bio-ring" style={{ ["--ring-progress" as string]: `${Math.round(props.rear.progress * 100)}%` }}>
                <span>{Math.round(props.rear.progress * 100)}%</span>
              </div>
              <p className="tm-subtle">{props.rear.stillHint}</p>
            </div>
          </div>
          {props.rear.torchHint ? <p className="tm-subtle">{props.rear.torchHint}</p> : null}
          {props.rear.error ? <p className="bio-error">{props.rear.error}</p> : null}
        </article>
      </div>

      <div className="bio-actions">
        <button type="button" className="tm-btn tm-btn-primary" onClick={props.primaryAction.onClick} disabled={props.primaryAction.disabled}>
          {props.primaryAction.label}
        </button>
        <button type="button" className="tm-btn tm-btn-ghost" onClick={props.historyAction.onClick}>
          {props.historyAction.label}
        </button>
        {props.cancelAction ? (
          <button type="button" className="tm-btn tm-btn-secondary" onClick={props.cancelAction.onClick}>
            {props.cancelAction.label}
          </button>
        ) : null}
      </div>

      {props.topError ? <p className="bio-error">{props.topError}</p> : null}
      {props.children}
    </section>
  );
}
