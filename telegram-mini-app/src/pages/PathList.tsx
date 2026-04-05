import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { pillarSortIndex } from "../data/pillars";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

export function PathListPage() {
  const { pathTitle, t } = useI18n();
  const { state } = useProgress();

  const sorted = [...PROGRAM_PATHS].sort(
    (a, b) => pillarSortIndex(a.pillarId) - pillarSortIndex(b.pillarId)
  );

  let prevPillar: (typeof sorted)[number]["pillarId"] | null = null;

  const items = sorted.flatMap((path) => {
    const sessions = path.sessionSlugs
      .map((slug) => SESSION_BY_SLUG[slug])
      .filter((s): s is NonNullable<(typeof SESSION_BY_SLUG)[string]> => Boolean(s))
      .filter((s) => !(s.sensual && state.sensualMode === "hidden"));

    if (sessions.length === 0) return [] as ReactNode[];

    const lockedCount = sessions.filter((s) => !s.freeTier && !state.premium).length;

    const nodes: ReactNode[] = [];
    if (path.pillarId !== prevPillar) {
      prevPillar = path.pillarId;
      nodes.push(
        <li key={`pillar-${path.pillarId}`} className="path-pillar">
          {t(`pillarLabel_${path.pillarId}`)}
        </li>
      );
    }

    nodes.push(
      <li key={path.id}>
        <Link to={`/path/${path.id}`} className="path-card">
          <span className="tm-pill">{t(`pillarTag_${path.pillarId}`)}</span>
          <h2 className="path-card-title">{pathTitle(path.id)}</h2>
          <p className="tm-subtle">{t(`pathIntro_${path.id}`)}</p>
          <div className="path-card-meta">
            <span>
              {sessions.length} {t("pathSessions")}
            </span>
            {lockedCount > 0 ? (
              <span>
                {lockedCount} {t("pathsLockedLabel")}
              </span>
            ) : (
              <span>{t("pathsOpenLabel")}</span>
            )}
          </div>
        </Link>
      </li>
    );

    return nodes;
  });

  return (
    <div className="tm-page">
      <header className="tm-head">
        <p className="tm-kicker">{t("pathsHeroKicker")}</p>
        <h1 className="tm-h1">{t("pathsHeroTitle")}</h1>
        <p className="tm-lead">{t("pathsHeroSub")}</p>
      </header>

      <ul className="paths-layout" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items}
      </ul>
    </div>
  );
}
