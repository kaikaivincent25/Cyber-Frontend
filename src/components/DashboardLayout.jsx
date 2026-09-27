import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext"; //[cite: 2]
import "./DashboardLayout.css";

const NAV_ITEMS = [
  { label: "Requests", path: "/dashboard/requests", roles: ["admin", "cashier"] },
  { label: "Sessions", path: "/dashboard/sessions", roles: ["admin", "cashier"] },
  { label: "Services", path: "/dashboard/services", roles: ["admin"] },
  { label: "Staff", path: "/dashboard/staff", roles: ["admin"] },
  { label: "My Profile", path: "/dashboard/profile", roles: ["admin", "cashier"] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth(); //[cite: 2]

  // Default to "admin" if role is missing during local development/testing
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role || "admin")
  );

  return (
    <div className="dashboard-shell-v2">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <span className="sidebar-brand">K CYBER CAFE</span>
          <span className="sidebar-badge">Portal</span>
        </div>
        
        <nav className="dashboard-nav">
          <span className="nav-group-label">Menu</span>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="dashboard-content-area">
        <header className="dashboard-content-topbar">
          <div className="topbar-left">
            {/* Breadcrumb or page title could go here later */}
          </div>
          <div className="topbar-right">
            {user && (
              <div className="topbar-user-info">
                <span className="user-name">{user.full_name || "Staff Member"}</span>
                <span className="user-role">{user.role || "Admin"}</span>
              </div>
            )}
            <button className="btn-logout-outline" onClick={logout}>Log out</button>
          </div>
        </header>

        <main className="dashboard-main-view">
          <Outlet />
        </main>
      </div>
    </div>
  );
}