import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-public">
        <Link to="/" className="navbar-brand" aria-label="Cyber Café Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          <span>Cyber Café</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Services
          </Link>
          <Link to="/track" className={isActive("/track") ? "active" : ""}>
            Track Request
          </Link>
        </div>
      </div>

      <div className="navbar-staff">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={`staff-link ${isActive("/dashboard") ? "active" : ""}`}>
              Dashboard
            </Link>
            <div className="staff-profile">
              <span className="staff-name">{user?.name || "Staff"}</span>
              <button onClick={logout} className="btn-logout" aria-label="Sign out of staff portal">
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-login-ghost">
            Staff Access
          </Link>
        )}
      </div>
    </nav>
  );
}