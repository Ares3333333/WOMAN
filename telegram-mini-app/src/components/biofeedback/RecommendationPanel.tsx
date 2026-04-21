type RecommendationPanelProps = {
  title: string;
  lead: string;
  stateTitle: string;
  stateSupport: string;
  confidenceLabel: string;
  confidenceValue: string;
  reason: string;
  patternLine: string;
  primaryLabel: string;
  onPrimary: () => void;
  rerunLabel: string;
  onRerun: () => void;
  alternateLabel?: string;
  onAlternate?: () => void;
};

export function RecommendationPanel(props: RecommendationPanelProps) {
  return (
    <section className="tm-card tm-card--quiet bio-rec-flow-card">
      <div className="bio-head">
        <p className="tm-kicker tm-kicker--muted">{props.title}</p>
        <h2 className="tm-h2">{props.lead}</h2>
      </div>

      <div className="bio-result-grid">
        <article className="bio-metric-pill">
          <span>{props.confidenceLabel}</span>
          <strong>{props.confidenceValue}</strong>
        </article>
      </div>

      <div className="bio-rec-card">
        <p className="tm-list-title">{props.stateTitle}</p>
        <p className="tm-subtle">{props.stateSupport}</p>
        <p className="tm-subtle">{props.reason}</p>
        <p className="tm-subtle">{props.patternLine}</p>
      </div>

      <div className="bio-actions">
        <button type="button" className="tm-btn tm-btn-primary" onClick={props.onPrimary}>
          {props.primaryLabel}
        </button>
        {props.alternateLabel && props.onAlternate ? (
          <button type="button" className="tm-btn tm-btn-secondary" onClick={props.onAlternate}>
            {props.alternateLabel}
          </button>
        ) : null}
        <button type="button" className="tm-btn tm-btn-ghost" onClick={props.onRerun}>
          {props.rerunLabel}
        </button>
      </div>
    </section>
  );
}
