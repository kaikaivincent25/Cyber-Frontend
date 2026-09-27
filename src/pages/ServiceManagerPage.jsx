import { useEffect, useState } from "react";
import { getAllServicesAdmin, createService, updateService } from "../api"; //[cite: 1]
import "./ServiceManagerPage.css";

const CATEGORIES = ["passport_aid", "ecitizen_service", "software_dev", "other"];

const emptyForm = {
  name: "",
  category: "passport_aid",
  description: "",
  estimated_government_fee: 0,
  estimated_service_fee: 0,
  requires_physical_visit: false,
};

export default function ServiceManagerPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    getAllServicesAdmin() //[cite: 1]
      .then(setServices)
      .catch((err) => setError(err.message || "Failed to load services."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  // Allow closing the drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showForm) setShowForm(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm]);

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setSaveError("");
    setShowForm(true);
  }

  function openEditForm(service) {
    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      estimated_government_fee: service.estimated_government_fee || 0,
      estimated_service_fee: service.estimated_service_fee || 0,
      requires_physical_visit: service.requires_physical_visit,
    });
    setEditingId(service.id);
    setSaveError("");
    setShowForm(true);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimated_government_fee: Number(form.estimated_government_fee),
        estimated_service_fee: Number(form.estimated_service_fee),
      };
      
      const saved = editingId
        ? await updateService(editingId, payload) //[cite: 1]
        : await createService(payload); //[cite: 1]

      setServices((prev) =>
        editingId
          ? prev.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...prev]
      );
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service) {
    try {
      const updated = await updateService(service.id, { is_active: !service.is_active }); //[cite: 1]
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  }

  return (
    <div className="manager-page-container">
      <div className="manager-header">
        <div>
          <span className="manager-kicker">Catalog operations</span>
          <h1 className="manager-title">Service Catalog</h1>
          <p className="manager-subtitle">Shape the services your customers see and make every option easy to understand.</p>
        </div>
        <button className="btn-primary-action" onClick={openNewForm}>
          <span aria-hidden="true">+</span> New Service
        </button>
      </div>

      <div className="manager-summary" aria-label="Catalog summary">
        <div className="manager-summary-item">
          <span>Total services</span>
          <strong>{services.length}</strong>
        </div>
        <div className="manager-summary-item manager-summary-active">
          <span>Visible to customers</span>
          <strong>{services.filter((service) => service.is_active).length}</strong>
        </div>
        <div className="manager-summary-item manager-summary-visit">
          <span>In-person services</span>
          <strong>{services.filter((service) => service.requires_physical_visit).length}</strong>
        </div>
      </div>

      {loading && (
        <div className="manager-status-box">
          <p className="dashboard-status">Loading services…</p>
        </div>
      )}
      
      {error && (
        <div className="manager-status-box">
          <p className="dashboard-status form-error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="table-container manager-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Est. Fee (KES)</th>
                <th>Physical Visit</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No services configured yet.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="manager-table-row">
                    <td className="font-medium">{s.name}</td>
                    <td className="capitalize">{s.category.replace(/_/g, " ")}</td>
                    <td className="font-numeric">
                      {(Number(s.estimated_government_fee || 0) + Number(s.estimated_service_fee || 0)).toLocaleString()}
                    </td>
                    <td>
                      {s.requires_physical_visit ? (
                        <span className="badge-warning">Required</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${s.is_active ? "status-active" : "status-inactive"}`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="data-table-actions text-right">
                      <button className="btn-text" onClick={() => openEditForm(s)}>Edit</button>
                      <button 
                        className={`btn-text ${s.is_active ? "text-danger" : "text-success"}`} 
                        onClick={() => toggleActive(s)}
                      >
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="drawer-backdrop" onClick={() => setShowForm(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-header">
              <h2 className="drawer-title">{editingId ? "Edit Service" : "New Service"}</h2>
              <button className="btn-close-drawer" onClick={() => setShowForm(false)} aria-label="Close form">
                ✕
              </button>
            </header>

            <div className="drawer-body">
              {saveError && <div className="alert-error" role="alert">{saveError}</div>}

              <form onSubmit={handleSave} className="service-form">
                <div className="form-field-group">
                  <label htmlFor="svc-name" className="form-field-label">Service Name</label>
                  <input
                    id="svc-name"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Passport Renewal"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="svc-category" className="form-field-label">Category</label>
                  <div className="select-wrapper">
                    <select
                      id="svc-category"
                      className="form-control form-select capitalize"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field-group">
                  <label htmlFor="svc-description" className="form-field-label">Description</label>
                  <textarea
                    id="svc-description"
                    className="form-control"
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Briefly describe what this service entails..."
                    required
                  />
                </div>

                <div className="fee-inputs-grid">
                  <div className="form-field-group">
                    <label className="form-field-label">Gov Fee (KES)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={form.estimated_government_fee}
                      onChange={(e) => updateField("estimated_government_fee", e.target.value)}
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Service Fee (KES)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={form.estimated_service_fee}
                      onChange={(e) => updateField("estimated_service_fee", e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={form.requires_physical_visit}
                      onChange={(e) => updateField("requires_physical_visit", e.target.checked)}
                    />
                    <span>Requires a physical visit to the café</span>
                  </label>
                </div>

                <div className="form-actions mt-4">
                  <button className="btn-primary w-100" type="submit" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "Save Changes" : "Create Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}