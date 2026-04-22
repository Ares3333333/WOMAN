type DevRuntimeOverlayProps = {
  phase: string;
  logs: string[];
  summary: {
    simultaneousCoreReady: boolean;
    rearPulseAlive: boolean;
    strictDualReady: boolean;
    fallbackTriggered: boolean;
    fallbackReason: string | null;
  };
};

export function DevRuntimeOverlay({ phase, logs, summary }: DevRuntimeOverlayProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <aside className="dev-runtime-overlay" aria-live="polite">
      <p className="dev-runtime-title">DEV runtime</p>
      <p className="dev-runtime-phase">phase: {phase}</p>
      <div className="dev-runtime-summary">
        <p className={`dev-runtime-pill ${summary.simultaneousCoreReady ? "ok" : "bad"}`}>
          core dual: {summary.simultaneousCoreReady ? "ready" : "not-ready"}
        </p>
        <p className={`dev-runtime-pill ${summary.rearPulseAlive ? "ok" : "bad"}`}>
          rear pulse: {summary.rearPulseAlive ? "alive" : "no-signal"}
        </p>
        <p className={`dev-runtime-pill ${summary.strictDualReady ? "ok" : "bad"}`}>
          strict dual: {summary.strictDualReady ? "confirmed" : "unconfirmed"}
        </p>
        <p className="dev-runtime-pill neutral">
          fallback: {summary.fallbackTriggered ? summary.fallbackReason ?? "yes" : "no"}
        </p>
      </div>
      <div className="dev-runtime-list">
        {logs.slice(-12).map((line, index) => (
          <p key={`${index}-${line}`} className="dev-runtime-line">
            {line}
          </p>
        ))}
      </div>
    </aside>
  );
}
