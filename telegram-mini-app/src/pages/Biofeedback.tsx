import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadBiofeedbackStore, summarizeBiofeedbackTrends } from "../lib/biofeedback";
import { useI18n } from "../lib/i18n";

function formatDate(value: string, lang: "ru" | "en"): string {
  try {
    const locale = lang === "ru" ? "ru-RU" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function BiofeedbackPage() {
  const { lang, t } = useI18n();
  const L = lang === "ru" ? "ru" : "en";
  const [store] = useState(() => loadBiofeedbackStore());

  const trend = useMemo(() => summarizeBiofeedbackTrends(store), [store]);
  const recentSessions = [...store.sessions].reverse().slice(0, 12);

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("bioHistoryTitle")}</h1>
        <p className="tm-lead">{t("bioHistorySub")}</p>
        <p className="tm-subtle">{t("bioWellnessDisclaimer")}</p>
      </header>

      <section className="tm-card tm-card--quiet">
        <div className="home-value-grid">
          <article className="home-value-item">
            <span className="home-value-number">{trend.completedSessions}</span>
            <span className="home-value-label">{t("bioTrendSessions")}</span>
          </article>
          <article className="home-value-item">
            <span className="home-value-number">{trend.avgPulseDelta ?? "—"}</span>
            <span className="home-value-label">{t("bioTrendAvgDrop")}</span>
          </article>
        </div>
        <p className="tm-subtle">
          {t("bioTrendEffectAvg")}: {trend.avgEffect ?? "—"}
        </p>
      </section>

      <section className="tm-card tm-card--quiet">
        <h2 className="tm-h2">{t("bioHistoryTitle")}</h2>

        {recentSessions.length === 0 ? (
          <p className="tm-subtle">{t("bioHistoryEmpty")}</p>
        ) : (
          <ul className="path-session-list">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <article className="path-session-item">
                  <div className="path-session-copy">
                    <span className="tm-list-title">{session.meditationSlug.replace(/-/g, " ")}</span>
                    <span className="tm-list-sub">{formatDate(session.startedAt, L)}</span>
                    <span className="tm-list-sub">
                      {t("bioEffectPulse")}: {session.prePulse ?? "—"} → {session.postPulse ?? "—"}
                    </span>
                    <span className="tm-list-sub">
                      {t("bioEffectCalm")}: {session.preCalmScore ?? "—"} → {session.postCalmScore ?? "—"}
                    </span>
                    <span className="tm-list-sub">
                      {t("bioEffectScore")}: {session.sessionEffect ?? "—"}
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        <Link to="/paths" className="tm-btn tm-btn-secondary tm-btn-block">
          {t("navPaths")}
        </Link>
      </section>
    </div>
  );
}
