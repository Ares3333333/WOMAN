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

function moodTone(effect: number | null): "up" | "flat" | "down" {
  if (effect == null) return "flat";
  if (effect >= 8) return "up";
  if (effect <= -8) return "down";
  return "flat";
}

export function BiofeedbackPage() {
  const { lang, t } = useI18n();
  const L = lang === "ru" ? "ru" : "en";

  const [store] = useState(() => loadBiofeedbackStore());
  const trend = useMemo(() => summarizeBiofeedbackTrends(store), [store]);
  const recentSessions = [...store.sessions].reverse().slice(0, 10);

  const trendText =
    trend.recentDirection === "up"
      ? t("bioHistoryTrendUp")
      : trend.recentDirection === "down"
        ? t("bioHistoryTrendDown")
        : t("bioHistoryTrendFlat");

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("bioHistoryTitle")}</h1>
        <p className="tm-lead">{t("bioHistorySub")}</p>
        <p className="tm-subtle">{t("bioWellnessDisclaimer")}</p>
      </header>

      <section className="tm-card tm-card--quiet bio-insight-hero">
        <div className="bio-insight-head">
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
          <article className="bio-average-card">
            <span>{t("bioTrendEffectAvg")}</span>
            <strong>{trend.avgEffect ?? "—"}</strong>
          </article>
        </div>
        <p className="tm-subtle">{trendText}</p>
      </section>

      <section className="tm-card tm-card--quiet">
        <div className="bio-history-head">
          <h2 className="tm-h2">{t("bioHistoryRecentTitle")}</h2>
          <Link to="/paths" className="tm-btn tm-btn-ghost">
            {t("navPaths")}
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="bio-empty">
            <p className="tm-subtle">{t("bioHistoryEmpty")}</p>
            <Link to="/paths" className="tm-btn tm-btn-primary tm-btn-block">
              {t("bioHistoryEmptyCta")}
            </Link>
          </div>
        ) : (
          <ul className="bio-history-list">
            {recentSessions.map((session) => (
              <li key={session.id} className={`bio-history-item tone-${moodTone(session.sessionEffect)}`}>
                <div className="bio-history-top">
                  <span className="tm-list-title">{session.meditationSlug.replace(/-/g, " ")}</span>
                  <span className="tm-list-sub">{formatDate(session.startedAt, L)}</span>
                </div>
                <div className="bio-history-metrics">
                  <span>
                    {t("bioEffectPulse")}: {session.prePulse ?? "—"} → {session.postPulse ?? "—"}
                  </span>
                  <span>
                    {t("bioEffectCalm")}: {session.preCalmScore ?? "—"} → {session.postCalmScore ?? "—"}
                  </span>
                  <strong>
                    {t("bioEffectScore")}: {session.sessionEffect ?? "—"}
                  </strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
