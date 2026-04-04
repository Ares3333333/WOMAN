import { Link, useParams } from "react-router-dom";
import { IconChevron } from "../components/MiniNavIcons";
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
      <Link to="/paths" className="session-back">
        ← {t("back")}
      </Link>
      <p className="page-eyebrow">{t(`pillarLabel_${path.pillarId}`)}</p>
      <h1 className="path-detail-title">{pathTitle(path.id)}</h1>
      <p className="sub path-detail-intro">{intro !== introKey ? intro : t("pathsSub")}</p>
      <ul className="path-session-list">
        {sessions.map((s) => (
          <li key={s.slug}>
            <Link to={`/session/${s.slug}`} className="home-support-row path-session-link">
              <div className="home-support-copy">
                <span className="home-support-title">{s.title[L]}</span>
                <p className="path-session-desc">{s.short[L]}</p>
                <SessionMetaRow session={s} t={t} className="session-meta-tight" />
              </div>
              <IconChevron className="home-support-chevron" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
