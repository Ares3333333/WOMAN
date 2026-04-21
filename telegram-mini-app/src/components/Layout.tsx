import { Link, NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { IconHome, IconPaths, IconProfile } from "./MiniNavIcons";

export function Layout() {
  const { t } = useI18n();
  const { state } = useProgress();

  return (
    <div className="app-reset-shell">
      <header className="app-reset-header">
        <div className="app-reset-header-inner">
          <span className="app-reset-brand">{t("brand")}</span>
          <Link to="/premium" className="app-reset-tier">
            {state.premium ? t("shellCircle") : t("shellStarter")}
          </Link>
        </div>
      </header>

      <main className="app-reset-main">
        <Outlet />
      </main>

      <nav className="app-reset-nav" aria-label={t("navAriaMain")}>
        <NavLink to="/" end className={({ isActive }) => `app-reset-nav-item${isActive ? " active" : ""}`}>
          <IconHome />
          <span>{t("navHome")}</span>
        </NavLink>
        <NavLink to="/paths" className={({ isActive }) => `app-reset-nav-item${isActive ? " active" : ""}`}>
          <IconPaths />
          <span>{t("navPaths")}</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `app-reset-nav-item${isActive ? " active" : ""}`}>
          <IconProfile />
          <span>{t("navProfile")}</span>
        </NavLink>
      </nav>
    </div>
  );
}

