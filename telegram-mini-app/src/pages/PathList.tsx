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

  const sorted = [...PROGRAM_PATHS].sort((a, b) => pillarSortIndex(a.pillarId) - pillarSortIndex(b.pillarId));

  let prevPillar: (typeof sorted)[number]["pillarId"] | null = null;

  const tierLabel = (tier: "free" | "mixed" | "premium") => {
    if (tier === "free") return t("tierFree");
    if (tier === "mixed") return t("tierMixed");
    return t("tierPremium");
  };

  const items = sorted.flatMap((path) => {
    const sessions = path.sessionSlugs
      .map((slug) => SESSION_BY_SLUG[slug])
      .filter((s): s is NonNullable<(typeof SESSION_BY_SLUG)[string]> => Boolean(s))
      .filter((s) => !(s.sensual && state.sensualMode === "hidden"));

    if (sessions.length === 0) return [] as ReactNode[];

    const freePreviewCount = sessions.filter((s) => s.freeTier).length;
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
        <Link to={`/path/${path.id}`} className={`path-card${path.tier === "premium" ? " path-card--premium" : ""}`}>
          <div className="path-card-head">
            <span className="tm-pill">{tierLabel(path.tier)}</span>
            {path.signature ? <span className="tm-pill tm-pill--accent">{t("pathsSignature")}</span> : null}
          </div>
          <h2 className="path-card-title">{pathTitle(path.id)}</h2>
          <p className="tm-subtle">{t(`pathIntro_${path.id}`)}</p>
          <div className="path-card-meta">
            <span>
              {sessions.length} {t("pathSessions")}
            </span>
            <span>
              {freePreviewCount > 0
                ? t("pathsPreviewCount").replace("{count}", String(freePreviewCount))
                : t("pathsMembersOnly")}
            </span>
          </div>
          {lockedCount > 0 ? <p className="path-locked-hint">{t("pathsLockedHint").replace("{count}", String(lockedCount))}</p> : null}
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
