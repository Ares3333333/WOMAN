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
};

export function RecommendationPanel(props: RecommendationPanelProps) {
  return (
    <section className="recommend-reset">
      <p className="recommend-reset-kicker">{props.title}</p>
      <h2 className="recommend-reset-title">{props.lead}</h2>
      <p className="recommend-reset-state">{props.stateTitle}</p>
      <p className="recommend-reset-sub">{props.stateSupport}</p>
      <p className="recommend-reset-sub">{props.reason}</p>
      <p className="recommend-reset-meta">
        {props.confidenceLabel}: {props.confidenceValue} · {props.patternLine}
      </p>

      <button type="button" className="recommend-reset-primary" onClick={props.onPrimary}>
        {props.primaryLabel}
      </button>

      <button type="button" className="recommend-reset-rerun" onClick={props.onRerun}>
        {props.rerunLabel}
      </button>
    </section>
  );
}

