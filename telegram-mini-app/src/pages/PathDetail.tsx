import { Link, useParams } from "react-router-dom";
import { SessionMetaRow } from "../components/SessionMetaRow";
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

  const introKey = `pathIntro_${path.id}`;
  const intro = t(introKey);

  return (
    <div className="page-head path-detail-page">
      <Link to="/paths" className="path-back-link">
        ← {t("back")}
      </Link>
      <p className="path-detail-pillar">{t(`pillarLabel_${path.pillarId}`)}</p>
      <h1 className="path-detail-title">{pathTitle(path.id)}</h1>
      <p className="sub path-detail-intro">{intro !== introKey ? intro : t("pathsSub")}</p>
      {sessions.map((s) => (
        <Link key={s.slug} to={`/session/${s.slug}`} className={`card session-card-link ${s.gradient}`}>
          <h2 className="session-card-title">{s.title[L]}</h2>
          <p className="session-card-desc">{s.short[L]}</p>
          <SessionMetaRow session={s} t={t} className="session-card-meta" />
        </Link>
      ))}
    </div>
  );
}
