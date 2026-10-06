import { useCallback, useState, useEffect } from "react";
import { getStaffMessages, sendStaffMessage } from "../api";
import ChatPanel from "./ChatPanel";
import StatusBadge from "./Statusbadge";
import "./RequestDetailDrawer.css";

const TRANSITIONS = {
  pending: ["assigned", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_ACTION_LABELS = {
  assigned: "Mark as Assigned",
  in_progress: "Start Progress",
  awaiting_payment: "Move to Awaiting Payment",
  completed: "Mark Completed",
  cancelled: "Cancel Request",
};

export default function RequestDetailDrawer({
  request,
  currentUser,
  onClose,
  onAssignToMe,
  onStatusChange,
  onFeesSave,
}) {
  const [govFee, setGovFee] = useState(request.government_fee || 0);
  const [serviceFee, setServiceFee] = useState(request.service_fee || 0);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const nextStatuses = TRANSITIONS[request.status] || [];
  const fetchMessages = useCallback(() => getStaffMessages(request.id), [request.id]);
  const sendMessage = useCallback(
    (body) => sendStaffMessage(request.id, body),
    [request.id],
  );

  // Allow closing the drawer with the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleAction(fn) {
    setActionError("");
    setSaving(true);
    try {
      await fn();
    } catch (err) {
      setActionError(err.message || "An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Prevents clicks inside the drawer from bubbling up to the backdrop and closing it
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={stopPropagation}>
        
        <header className="drawer-header">
          <div>
            <span className="drawer-subtitle">Tracking Code</span>
            <h2 className="drawer-title">{request.tracking_code}</h2>
          </div>
          <button className="btn-close-drawer" onClick={onClose} aria-label="Close drawer">
            ✕
          </button>
        </header>

        <div className="drawer-body">
          {actionError && (
            <div className="alert-error drawer-error" role="alert">
              {actionError}
            </div>
          )}

          <div className="drawer-section">
            <h3 className="section-label">Guest Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-key">Name</span>
                <span className="info-value">{request.guest_name}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Phone</span>
                <span className="info-value">{request.guest_phone}</span>
              </div>
              {request.guest_email && (
                <div className="info-item info-full">
                  <span className="info-key">Email</span>
                  <span className="info-value">{request.guest_email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="drawer-section">
            <h3 className="section-label">Submitted Details</h3>
            {Object.entries(request.form_data || {}).length === 0 ? (
              <p className="text-muted">No additional details submitted.</p>
            ) : (
              <div className="info-grid">
                {Object.entries(request.form_data).map(([key, value]) => (
                  <div className="info-item info-full" key={key}>
                    <span className="info-key">{key.replace(/_/g, " ")}</span>
                    <span className="info-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-section">
            <h3 className="section-label">Assignment & Status</h3>
            <div className="status-assignment-row">
              <div className="status-display">
                <StatusBadge status={request.status} />
              </div>
              
              <div className="assignment-display">
                {request.assigned_staff_id ? (
                  <span className="staff-badge">Assigned: Staff #{request.assigned_staff_id}</span>
                ) : (
                  <button
                    className="btn-secondary btn-sm"
                    disabled={saving}
                    onClick={() => handleAction(() => onAssignToMe(request.id, currentUser?.id))}
                  >
                    Assign to me
                  </button>
                )}
              </div>
            </div>

            {nextStatuses.length > 0 && (
              <div className="action-buttons-group">
                {nextStatuses.map((next) => (
                  <button
                    key={next}
                    className={next === "cancelled" ? "btn-danger" : "btn-primary"}
                    disabled={saving}
                    onClick={() => handleAction(() => onStatusChange(request.id, next))}
                  >
                    {STATUS_ACTION_LABELS[next]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-section">
            <h3 className="section-label">Fee Management (KES)</h3>
            <div className="fee-inputs-grid">
              <div className="form-field-group">
                <label className="form-field-label">Government Fee</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={govFee} 
                  onChange={(e) => setGovFee(e.target.value)}
                  min="0"
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Service Fee</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={serviceFee} 
                  onChange={(e) => setServiceFee(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <button
              className="btn-secondary w-100 mt-3"
              disabled={saving}
              onClick={() =>
                handleAction(() =>
                  onFeesSave(request.id, { 
                    government_fee: Number(govFee), 
                    service_fee: Number(serviceFee) 
                  })
                )
              }
            >
              {saving ? "Saving..." : "Save Fees"}
            </button>
          </div>

          <div className="drawer-section">
            <h3 className="section-label">Conversation</h3>
            <div className="chat-container">
              <ChatPanel
                fetchMessages={fetchMessages}
                sendMessage={sendMessage}
                isMine={(message) => message.sender_staff_id === currentUser?.id}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}