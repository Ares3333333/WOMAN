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
    const count = path.sessionSlugs.filter((slug) => {
      const s = SESSION_BY_SLUG[slug];
      if (!s) return false;
      if (s.sensual && state.sensualMode === "hidden") return false;
      return true;
    }).length;
    if (count === 0) return [] as ReactNode[];

    const nodes: ReactNode[] = [];
    if (path.pillarId !== prevPillar) {
      prevPillar = path.pillarId;
      nodes.push(
        <li key={`pillar-${path.pillarId}`} className="path-pillar-heading">
          <p className="path-pillar-label">{t(`pillarLabel_${path.pillarId}`)}</p>
        </li>
      );
    }
    nodes.push(
      <li key={path.id}>
        <Link to={`/path/${path.id}`} className="card path-list-card">
          <span className="path-list-tag">{t(`pillarTag_${path.pillarId}`)}</span>
          <h2 className="path-list-card-title">{pathTitle(path.id)}</h2>
          <p className="path-list-card-meta">
            {count} {t("pathSessions")}
          </p>
        </Link>
      </li>
    );
    return nodes;
  });

  return (
    <div className="page-head path-list-page">
      <p className="page-eyebrow">{t("pathsCatalogEyebrow")}</p>
      <h1>{t("pathsTitle")}</h1>
      <p className="sub paths-catalog-lead">{t("pathsSub")}</p>
      <ul className="path-list-ul">{items}</ul>
    </div>
  );
}
