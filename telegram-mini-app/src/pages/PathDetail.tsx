import { Link, useParams } from "react-router-dom";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, type MiniSession } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

export function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, pathTitle, t } = useI18n();
  const { state } = useProgress();
  const L = lang === "ru" ? "ru" : "en";

  const path = PROGRAM_PATHS.find((p) => p.id === id);
  if (!path) {
    return (
      <p>
        <Link to="/paths">{t("back")}</Link>
      </p>
    );
  }

  const sessions = path.sessionSlugs
    .map((slug) => SESSION_BY_SLUG[slug])
    .filter((s): s is MiniSession => Boolean(s))
    .filter((s) => !(s.sensual && state.sensualMode === "hidden"));

  return (
    <div className="page-head">
      <Link to="/paths" style={{ fontSize: "0.85rem", color: "var(--tg-hint)" }}>
        ← {t("back")}
      </Link>
      <h1 style={{ marginTop: 12 }}>{pathTitle(path.id)}</h1>
      <p className="sub">{t("pathsSub")}</p>
      {sessions.map((s) => (
        <Link key={s.slug} to={`/session/${s.slug}`} className={`card ${s.gradient}`}>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>{s.title[L]}</h2>
          <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.9 }}>{s.short[L]}</p>
          <p style={{ margin: "10px 0 0", fontSize: "0.72rem", opacity: 0.75 }}>
            {s.durationMin} {t("sessionMin")} · {s.freeTier ? t("free") : t("sessionPremium")}
          </p>
        </Link>
      ))}
    </div>
  );
}
