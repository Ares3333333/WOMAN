import type { MiniSession } from "../data/sessions";

type Props = {
  session: MiniSession;
  t: (key: string) => string;
  className?: string;
};

export function SessionMetaRow({ session, t, className }: Props) {
  return (
    <div className={`session-meta-row${className ? ` ${className}` : ""}`}>
      <span className="session-meta-pillar">{t(`pillarTag_${session.pillarId}`)}</span>
      <span className="session-meta-dot" aria-hidden>
        •
      </span>
      <span className="session-meta-dur">
        {session.durationMin} {t("sessionMin")}
      </span>
      <span className="session-meta-dot" aria-hidden>
        •
      </span>
      <span className="session-meta-tier">{session.freeTier ? t("free") : t("sessionPremium")}</span>
    </div>
  );
}
