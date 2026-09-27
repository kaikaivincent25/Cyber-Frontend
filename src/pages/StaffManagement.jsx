import { useEffect, useState } from "react";
import { getAllStaff, createStaffAccount } from "../api";
import "./StaffManagement.css";

const emptyForm = {
  full_name: "",
  email: "",
  phone_number: "",
  password: "",
  role: "cashier",
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    setError("");
    getAllStaff()
      .then(setStaff)
      .catch((err) => setError(err.message || "Failed to load staff."))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  useEffect(() => {
    if (!showForm) return undefined;

    function handleDialogKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        setShowForm(false);
        setSaveError("");
        setForm(emptyForm);
      }
    }

    window.addEventListener("keydown", handleDialogKeyDown);
    return () => window.removeEventListener("keydown", handleDialogKeyDown);
  }, [showForm, saving]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setSaveError("");
    setForm(emptyForm);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const created = await createStaffAccount(form);
      setStaff((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message || "Failed to create account.");
    } finally {
      setSaving(false);
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleStaff = staff.filter((member) => {
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const searchable = [member.full_name, member.email, member.phone_number]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesRole && searchable.includes(normalizedSearch);
  });
  
  const adminCount = staff.filter((member) => member.role === "admin").length;
  const cashierCount = staff.filter((member) => member.role === "cashier").length;

  return (
    <main className="staff-page">
      <div className="staff-container">
        
        {/* Header Section */}
        <header className="staff-header-row">
          <div className="staff-header-content">
            <span className="staff-kicker">Team Management</span>
            <h1 className="staff-title">Staff Accounts</h1>
            <p className="staff-subtitle">Manage who can access your café workspace.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setForm(emptyForm); setSaveError(""); setShowForm(true); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Staff Member
          </button>
        </header>

        {/* Summary Metrics */}
        <section className="staff-summary" aria-label="Staff account totals">
          <div className="summary-card">
            <div className="summary-icon icon-total" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="summary-data">
              <span className="summary-label">Total Team</span>
              <strong className="summary-value">{staff.length}</strong>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon icon-admin" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="summary-data">
              <span className="summary-label">Administrators</span>
              <strong className="summary-value">{adminCount}</strong>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon icon-cashier" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div className="summary-data">
              <span className="summary-label">Cashiers</span>
              <strong className="summary-value">{cashierCount}</strong>
            </div>
          </div>
        </section>

        {/* Directory Card */}
        <section className="directory-card" aria-labelledby="staff-directory-title">
          <div className="directory-header">
            <div>
              <h2 id="staff-directory-title" className="directory-title">Team Directory</h2>
              <p className="directory-subtitle">Find an account by name, email, or phone number.</p>
            </div>
            <button className="btn-ghost" onClick={reload} disabled={loading} aria-label="Refresh list">
              <svg className={loading ? "spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <div className="directory-toolbar">
            <div className="search-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Search the team..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search staff"
              />
            </div>
            
            <div className="filter-group">
              <select className="role-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role">
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="cashier">Cashiers</option>
              </select>
            </div>
            
            <span className="result-count" aria-live="polite">
              {loading ? "Loading..." : `${visibleStaff.length} ${visibleStaff.length === 1 ? "member" : "members"}`}
            </span>
          </div>

          <div className="directory-content">
            {loading && (
              <div className="state-container" role="status">
                <div className="loader-spinner"></div>
                <span>Loading staff accounts...</span>
              </div>
            )}
            
            {error && (
              <div className="state-container state-error" role="alert">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
                <button className="btn-secondary btn-sm" onClick={reload}>Try Again</button>
              </div>
            )}
            
            {!loading && !error && visibleStaff.length === 0 && (
              <div className="state-container state-empty">
                <div className="empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {staff.length === 0 ? (
                      <>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </>
                    ) : (
                      <>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </>
                    )}
                  </svg>
                </div>
                <h3>{staff.length === 0 ? "No staff accounts yet" : "No matching team members"}</h3>
                <p>{staff.length === 0 ? "Add an account to give a teammate access to the workspace." : "Try a different search or role filter."}</p>
                {staff.length === 0 && (
                  <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>Add First Staff Member</button>
                )}
              </div>
            )}
            
            {!loading && !error && visibleStaff.length > 0 && (
              <div className="table-responsive">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Contact</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStaff.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="member-cell">
                            <div className={`member-avatar avatar-${member.role}`} aria-hidden="true">
                              {member.full_name?.trim().charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="member-details">
                              <span className="member-name">{member.full_name}</span>
                              <span className="member-email">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="contact-cell">{member.phone_number || <span className="text-muted">Not provided</span>}</td>
                        <td>
                          <span className={`badge badge-${member.role}`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Creation Modal */}
        {showForm && (
          <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
            <dialog className="modal-content" open aria-modal="true" aria-labelledby="staff-dialog-title">
              
              <div className="modal-header">
                <div>
                  <span className="staff-kicker">Team Management</span>
                  <h2 id="staff-dialog-title" className="modal-title">Create Staff Account</h2>
                </div>
                <button className="btn-close" type="button" onClick={closeForm} aria-label="Close dialog" disabled={saving}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveError && <div className="alert-error" role="alert">{saveError}</div>}

              <form className="modal-form" onSubmit={handleCreate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="staff-name">Full Name</label>
                    <input id="staff-name" autoComplete="name" autoFocus value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="staff-email">Work Email</label>
                    <input id="staff-email" type="email" autoComplete="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="staff-phone">Phone Number</label>
                    <input id="staff-phone" type="tel" autoComplete="tel" value={form.phone_number} onChange={(e) => updateField("phone_number", e.target.value)} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="staff-role">Workspace Role</label>
                    <div className="select-wrapper">
                      <select id="staff-role" value={form.role} onChange={(e) => updateField("role", e.target.value)}>
                        <option value="cashier">Cashier</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="staff-password">Temporary Password</label>
                    <input id="staff-password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
                    <span className="field-hint">Use at least 8 characters. The staff member can change it after signing in.</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-secondary" type="button" onClick={closeForm} disabled={saving}>Cancel</button>
                  <button className="btn-primary" type="submit" disabled={saving}>
                    {saving ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>
            </dialog>
          </div>
        )}
      </div>
    </main>
  );
}