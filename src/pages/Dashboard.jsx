import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext"; //[cite: 2]
import {
  getAllRequests,
  assignRequestToStaff,
  updateRequestStatus,
  updateRequestFees,
} from "../api"; //[cite: 1]

import StatusBadge from "../components/Statusbadge";

import RequestDetailDrawer from "../components/RequestDetailDrawer";
import "./Dashboard.css";

const TABS = [
  { key: "all", label: "All Requests" },
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Dashboard() {
  const { user, logout } = useAuth(); //[cite: 2]
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  function reload() {
    setLoading(true);
    getAllRequests() //[cite: 1]
      .then(setRequests)
      .catch((err) => setError(err.message || "Failed to load requests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  const visibleRequests =
    activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab);

  async function handleAssignToMe(requestId, staffId) {
    try {
      const updated = await assignRequestToStaff(requestId, staffId); //[cite: 1]
      applyUpdate(updated);
    } catch (err) {
      alert(err.message || "Failed to assign request.");
    }
  }

  async function handleStatusChange(requestId, status) {
    try {
      const updated = await updateRequestStatus(requestId, status); //[cite: 1]
      applyUpdate(updated);
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  }

  async function handleFeesSave(requestId, fees) {
    try {
      const updated = await updateRequestFees(requestId, fees); //[cite: 1]
      applyUpdate(updated);
    } catch (err) {
      throw err; // Let the drawer handle displaying this specific error
    }
  }

  function applyUpdate(updated) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
  }

  return (
    <div className="dashboard-shell">
    
      <div className="dashboard-toolbar">
        <div className="dashboard-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`dashboard-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">
                {tab.key === "all" 
                  ? requests.length 
                  : requests.filter(r => r.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
        <button className="btn-refresh" onClick={reload} disabled={loading} title="Refresh Data">
          ↻
        </button>
      </div>

      <main className="dashboard-main">
        <div className="dashboard-intro">
          <div>
            <span className="dashboard-kicker">Operations overview</span>
            <h1>Good to see you, {user?.full_name?.split(" ")[0] || "there"}.</h1>
            <p>Keep an eye on incoming requests and help every customer move forward.</p>
          </div>
          <div className="dashboard-summary" aria-label="Request summary">
            <div className="summary-item">
              <span className="summary-label">Total requests</span>
              <strong>{requests.length}</strong>
            </div>
            <div className="summary-item summary-item-attention">
              <span className="summary-label">Needs attention</span>
              <strong>{requests.filter((r) => ["pending", "awaiting_payment"].includes(r.status)).length}</strong>
            </div>
            <div className="summary-item summary-item-success">
              <span className="summary-label">Completed</span>
              <strong>{requests.filter((r) => r.status === "completed").length}</strong>
            </div>
          </div>
        </div>

        {loading && (
          <div className="dashboard-status-container">
            <p className="dashboard-status">Loading requests…</p>
          </div>
        )}
        
        {error && (
          <div className="dashboard-status-container">
            <p className="dashboard-status form-error">{error}</p>
          </div>
        )}

        {!loading && !error && visibleRequests.length === 0 && (
          <div className="dashboard-status-container empty-state">
            <p className="dashboard-status">No requests found in this view.</p>
          </div>
        )}

        {!loading && !error && visibleRequests.length > 0 && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Guest Name</th>
                  <th>Status</th>
                  <th>Total Fee (KES)</th>
                  <th>Assigned To</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((r) => {
                  const totalFee = Number(r.government_fee || 0) + Number(r.service_fee || 0);
                  
                  return (
                    <tr key={r.id} onClick={() => setSelected(r)} className="data-table-row">
                      <td className="data-table-code">{r.tracking_code}</td>
                      <td className="font-medium">{r.guest_name}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="font-numeric">{totalFee > 0 ? totalFee.toLocaleString() : "—"}</td>
                      <td className="text-muted">
                        {r.assigned_staff_id ? `Staff #${r.assigned_staff_id}` : "Unassigned"}
                      </td>
                      <td className="text-muted">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <RequestDetailDrawer
          request={selected}
          currentUser={user}
          onClose={() => setSelected(null)}
          onAssignToMe={handleAssignToMe}
          onStatusChange={handleStatusChange}
          onFeesSave={handleFeesSave}
        />
      )}
    </div>
  );
}