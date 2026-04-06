import { Link } from "react-router-dom";
import { PROGRAM_PATHS } from "../data/programs";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

type Collection = {
  id: string;
  title: string;
  subtitle: string;
  pathIds: string[];
  premium?: boolean;
};

export function PathListPage() {
  const { lang, pathTitle, t } = useI18n();
  const { state } = useProgress();
  const L = lang === "ru" ? "ru" : "en";

  const findPath = (ids: string[]) => ids.find((id) => PROGRAM_PATHS.some((p) => p.id === id));

  const collections: Collection[] =
    L === "ru"
      ? [
          {
            id: "stress",
            title: "Stress",
            subtitle: "Снять перегруз и вернуть ровный темп.",
            pathIds: ["overload_cycle_care", "nervous_system"],
          },
          {
            id: "sleep",
            title: "Sleep",
            subtitle: "Тихий переход в ночь и более глубокий сон.",
            pathIds: ["sleep_deep_rest", "premium_sleep_collection"],
          },
          {
            id: "body-reset",
            title: "Body reset",
            subtitle: "Вернуть контакт с телом и дыханием.",
            pathIds: ["body_embodiment", "nervous_system"],
          },
          {
            id: "circle",
            title: "Circle",
            subtitle: "Премиальные вечерние коллекции и private-маршруты.",
            pathIds: ["signature_evening_rituals", "cycle_rhythm_support"],
            premium: true,
          },
        ]
      : [
          {
            id: "stress",
            title: "Stress",
            subtitle: "Lower overload and regain a steady pace.",
            pathIds: ["overload_cycle_care", "nervous_system"],
          },
          {
            id: "sleep",
            title: "Sleep",
            subtitle: "A calmer transition into deeper sleep.",
            pathIds: ["sleep_deep_rest", "premium_sleep_collection"],
          },
          {
            id: "body-reset",
            title: "Body reset",
            subtitle: "Reconnect with your body and breath.",
            pathIds: ["body_embodiment", "nervous_system"],
          },
          {
            id: "circle",
            title: "Circle",
            subtitle: "Premium evening collections and private routes.",
            pathIds: ["signature_evening_rituals", "cycle_rhythm_support"],
            premium: true,
          },
        ];

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("navPaths")}</h1>
        <p className="tm-lead">{L === "ru" ? "Кураторские коллекции без перегруза." : "Curated collections with clear intent."}</p>
      </header>

      <ul className="library-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {collections.map((collection) => {
          const primaryPathId = findPath(collection.pathIds);
          if (!primaryPathId) return null;

          const lockCircle = Boolean(collection.premium && !state.premium);
          const href = lockCircle ? "/premium" : `/path/${primaryPathId}`;

          return (
            <li key={collection.id}>
              <Link to={href} className="library-row">
                <div className="library-row-head">
                  <h2 className="library-row-title">{collection.title}</h2>
                  {collection.premium ? <span className="tm-pill tm-pill--accent">{t("tierPremium")}</span> : null}
                </div>
                <p className="tm-subtle">{collection.subtitle}</p>
                <p className="tm-list-sub">{pathTitle(primaryPathId)}</p>
                {lockCircle ? <p className="path-locked-hint">{t("homePrimaryLockedCta")}</p> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
