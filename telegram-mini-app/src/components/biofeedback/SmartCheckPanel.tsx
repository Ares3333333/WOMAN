import type { ReactNode, RefObject } from "react";
import type { PulseScanState } from "../../lib/cameraPulseScan";

type SmartCheckPanelProps = {
  title: string;
  lead: string;
  disclaimer: string;
  probeHint: string;
  front: {
    status: string;
    progress: number;
    quality: string;
    confidence: string;
    hint: string;
    error?: string | null;
    videoRef: RefObject<HTMLVideoElement>;
    overlayRef: RefObject<HTMLCanvasElement>;
    running: boolean;
  };
  rear: {
    status: string;
    progress: number;
    targetHint: string;
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
  historyAction?: {
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
  const rearLiveClass = props.rear.state === "measuring" || props.rear.state === "signal_found" ? "is-live" : "";

  return (
    <section className="smart-check">
      <header className="smart-check-head">
        <p className="smart-check-kicker">{props.title}</p>
        <h2 className="smart-check-title">{props.lead}</h2>
        <p className="smart-check-sub">{props.probeHint}</p>
      </header>

      <div className="smart-check-stage">
        <div className="smart-rear-stage">
          <div className="smart-rear-topline">
            <span className={`smart-rear-lens ${rearLiveClass}`} />
            <p>{props.rear.targetHint}</p>
          </div>

          <div className="smart-rear-progress" aria-hidden>
            <span style={{ width: `${Math.round(props.rear.progress * 100)}%` }} />
          </div>

          <p className="smart-rear-status">{props.rear.status}</p>
          <p className="smart-rear-meta">{props.rear.coverHint}</p>
          <p className="smart-rear-meta">{props.rear.stillHint}</p>
          <p className="smart-rear-meta">{props.rear.selectedCamera}</p>
          {props.rear.liveHint ? <p className="smart-rear-meta strong">{props.rear.liveHint}</p> : null}
          {props.rear.torchHint ? <p className="smart-rear-meta">{props.rear.torchHint}</p> : null}
        </div>

        <div className="smart-front-pip-wrap">
          <div className="smart-front-pip">
            <video ref={props.front.videoRef} className="smart-front-video" playsInline muted />
            <canvas ref={props.front.overlayRef} className="smart-front-overlay" />
            {!props.front.running ? <p className="smart-front-hint">{props.front.hint}</p> : null}
          </div>
          <div className="smart-front-meta">
            <span>{props.front.status}</span>
            <span>Q {props.front.quality}</span>
            <span>C {props.front.confidence}</span>
            <span>{Math.round(props.front.progress * 100)}%</span>
          </div>
        </div>
      </div>

      {props.front.error ? <p className="smart-check-error">{props.front.error}</p> : null}
      {props.rear.error ? <p className="smart-check-error">{props.rear.error}</p> : null}
      {props.topError ? <p className="smart-check-error">{props.topError}</p> : null}

      {props.children}

      <div className="smart-check-actions">
        <button type="button" className="smart-primary-btn" onClick={props.primaryAction.onClick} disabled={props.primaryAction.disabled}>
          {props.primaryAction.label}
        </button>
        <div className="smart-secondary-row">
          {props.historyAction ? (
            <button type="button" className="smart-text-btn" onClick={props.historyAction.onClick}>
              {props.historyAction.label}
            </button>
          ) : null}
          {props.cancelAction ? (
            <button type="button" className="smart-text-btn" onClick={props.cancelAction.onClick}>
              {props.cancelAction.label}
            </button>
          ) : null}
        </div>
      </div>

      <p className="smart-check-disclaimer">{props.disclaimer}</p>
    </section>
  );
}
