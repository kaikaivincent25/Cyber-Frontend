import "./StatusBadge.css";

const STATUS_LABELS = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In progress",
  awaiting_payment: "Awaiting payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }) {
  // Fallback to prevent breaking if status is unexpectedly null or undefined
  const safeStatus = status ? status.toLowerCase() : "pending";

  return (
    <span
      className={`status-badge status-${safeStatus}`}
      aria-label={`Request status: ${STATUS_LABELS[safeStatus] || status || "Pending"}`}
      style={{
        background: `var(--status-${safeStatus}-bg)`,
        color: `var(--status-${safeStatus}-text)`,
      }}
    >
      <span className="status-badge-dot" aria-hidden="true" />
      {STATUS_LABELS[safeStatus] || status}
    </span>
  );
}