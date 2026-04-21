type OutcomeGuidanceCardProps = {
  todayTitle: string;
  tomorrowTitle: string;
  todayText: string;
  tomorrowText: string;
  quote: string;
};

export function OutcomeGuidanceCard(props: OutcomeGuidanceCardProps) {
  return (
    <div className="bio-guidance-card">
      <div className="bio-guidance-line">
        <span>{props.todayTitle}</span>
        <p className="tm-subtle">{props.todayText}</p>
      </div>
      <div className="bio-guidance-line">
        <span>{props.tomorrowTitle}</span>
        <p className="tm-subtle">{props.tomorrowText}</p>
      </div>
      <div className="bio-guidance-quote">{props.quote}</div>
    </div>
  );
}
