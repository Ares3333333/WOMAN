import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../lib/i18n";

export function Layout() {
  const { t } = useI18n();
  return (
    <>
      <div className="app-shell">
        <Outlet />
      </div>
      <nav className="bottom-nav" aria-label="Main">
        <NavLink end className={({ isActive }) => (isActive ? "active" : "")} to="/">
          {t("navHome")}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/paths">
          {t("navPaths")}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/goals">
          {t("navGoals")}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/profile">
          {t("navProfile")}
        </NavLink>
      </nav>
    </>
  );
}
