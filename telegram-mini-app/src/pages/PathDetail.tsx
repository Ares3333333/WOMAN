import { Link, useNavigate, useParams } from "react-router-dom";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, type MiniSession } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

export function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, pathTitle, t } = useI18n();
  const { state } = useProgress();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const path = PROGRAM_PATHS.find((p) => p.id === id);

  const tierLabel = (tier: "free" | "mixed" | "premium") => {
    if (tier === "free") return t("tierFree");
    if (tier === "mixed") return t("tierMixed");
    return t("tierPremium");
  };

  if (!path) {
    return (
      <div className="tm-page">
        <Link to="/paths" className="session-back">
          {"<"} {t("back")}
        </Link>
        <section className="tm-card">
          <h2 className="tm-h2">{t("pathNotFound")}</h2>
          <p className="tm-subtle">{t("pathNotFoundSub")}</p>
        </section>
      </div>
    );
  }

  const sessions = path.sessionSlugs
    .map((slug) => SESSION_BY_SLUG[slug])
    .filter((s): s is MiniSession => Boolean(s))
    .filter((s) => !(s.sensual && state.sensualMode === "hidden"));

  return (
    <div className="tm-page">
      <Link to="/paths" className="session-back">
        {"<"} {t("back")}
      </Link>

      <section className="path-detail-hero">
        <div className="path-card-head">
          <span className="tm-pill">{tierLabel(path.tier)}</span>
          {path.signature ? <span className="tm-pill tm-pill--accent">{t("pathsSignature")}</span> : null}
        </div>
        <h1 className="tm-h1">{pathTitle(path.id)}</h1>
        <p className="tm-subtle">
          {sessions.length} {t("pathSessions")}
        </p>
      </section>

      {path.tier === "premium" && !state.premium ? (
        <section className="tm-card session-gate">
          <p className="tm-subtle">{t("pathsPremiumGateSub")}</p>
          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={() => nav("/premium")}>
            {t("pathsPremiumGateCta")}
          </button>
        </section>
      ) : null}

      <ul className="path-session-list">
        {sessions.map((s) => {
          const locked = !s.freeTier && !state.premium;

          if (locked) {
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  className="path-session-item path-session-item--locked path-session-button"
                  onClick={() => nav("/premium")}
                >
                  <div className="path-session-copy">
                    <span className="tm-list-title">{s.title[L]}</span>
                    <span className="tm-list-sub">
                      {s.durationMin} {t("sessionMin")} · {t("sessionPremium")}
                    </span>
                  </div>
                </button>
              </li>
            );
          }

          return (
            <li key={s.slug}>
              <Link to={`/session/${s.slug}`} className="path-session-item">
                <div className="path-session-copy">
                  <span className="tm-list-title">{s.title[L]}</span>
                  <span className="tm-list-sub">
                    {s.durationMin} {t("sessionMin")}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
