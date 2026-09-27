import { useEffect, useState } from "react";
import { getAllSessions, createSession, endSession } from "../api"; //[cite: 1]
import "./SessionsPage.css";

const emptyForm = { client_name: "", id_number: "", terminal_number: "" };

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [endingId, setEndingId] = useState(null);

  function reload() {
    setLoading(true);
    getAllSessions() //[cite: 1]
      .then(setSessions)
      .catch((err) => setError(err.message || "Failed to load sessions."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const created = await createSession({ //[cite: 1]
        client_name: form.client_name,
        id_number: form.id_number,
        terminal_number: Number(form.terminal_number),
        start_time: new Date().toISOString(),
      });
      setSessions((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message || "Failed to start session.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnd(session) {
    setEndingId(session.id);
    setError("");
    try {
      const updated = await endSession(session.id, new Date().toISOString()); //[cite: 1]
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      setError(err.message || "Failed to end session.");
    } finally {
      setEndingId(null);
    }
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-KE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  }

  return (
    <div className="manager-page-container">
      <div className="manager-header">
        <div>
          <h1 className="manager-title">Terminal Sessions</h1>
          <p className="manager-subtitle">Manage physical walk-in clients and active computer usage.</p>
        </div>
        <button 
          className="btn-primary-action" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close Form" : "+ Start Session"}
        </button>
      </div>

      {showForm && (
        <div className="inline-form-card">
          <form onSubmit={handleCreate} className="session-form">
            <h3 className="form-title">New Walk-in Session</h3>
            {saveError && <div className="alert-error" role="alert">{saveError}</div>}
            
            <div className="inline-inputs-row">
              <div className="form-field-group flex-2">
                <label className="form-field-label">Client Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  value={form.client_name}
                  onChange={(e) => updateField("client_name", e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field-group flex-2">
                <label className="form-field-label">National ID Number</label>
                <input
                  className="form-control"
                  placeholder="e.g. 12345678"
                  value={form.id_number}
                  onChange={(e) => updateField("id_number", e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field-group flex-1">
                <label className="form-field-label">Terminal #</label>
                <input
                  className="form-control"
                  placeholder="e.g. 5"
                  type="number"
                  min="1"
                  value={form.terminal_number}
                  onChange={(e) => updateField("terminal_number", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="inline-form-actions">
              <button 
                className="btn-secondary" 
                type="button" 
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Starting…" : "Start Session"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="manager-status-box">
          <p className="dashboard-status">Loading sessions…</p>
        </div>
      )}
      
      {error && (
        <div className="manager-status-box">
          <p className="dashboard-status form-error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Terminal</th>
                <th>Client</th>
                <th>ID Number</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No terminal sessions logged today.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="manager-table-row">
                    <td className="font-numeric font-medium">T-{s.terminal_number}</td>
                    <td className="font-medium">{s.client_name}</td>
                    <td className="font-numeric text-muted">{s.id_number}</td>
                    <td>{formatTime(s.start_time)}</td>
                    <td>{s.end_time ? formatTime(s.end_time) : "—"}</td>
                    <td>
                      <span className={`status-pill ${!s.end_time ? "status-active" : "status-inactive"}`}>
                        {!s.end_time ? "Active" : "Ended"}
                      </span>
                    </td>
                    <td className="data-table-actions text-right">
                      {!s.end_time ? (
                        <button
                          className="btn-text text-danger"
                          onClick={() => handleEnd(s)}
                          disabled={endingId === s.id}
                        >
                          {endingId === s.id ? "Ending…" : "End Session"}
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}