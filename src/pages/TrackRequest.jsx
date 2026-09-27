import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackRequest } from "../api"; //[cite: 1]
import "./TrackRequest.css";

const STATUS_LABELS = {
  pending: "Received — awaiting assignment",
  assigned: "Assigned to a staff member",
  in_progress: "In progress",
  awaiting_payment: "Awaiting payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TrackRequest() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    
    try {
      const data = await trackRequest(code.trim()); //[cite: 1]
      setResult(data);
    } catch (err) {
      setError("We couldn't find a request with that tracking code. Please check it and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-page-container">
      <nav className="track-nav">
        <button className="link-back" onClick={() => navigate("/")}>
          ← Back to Catalog
        </button>
      </nav>

      <div className="track-card">
        <header className="track-header">
          <h1 className="track-title">Track Your Request</h1>
          <p className="track-subtitle">
            Enter the unique tracking code you received when you submitted your request.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="track-form">
          <div className="form-field-group">
            <label htmlFor="code" className="form-field-label">Tracking Code</label>
            <div className="track-input-wrapper">
              <input
                id="code"
                className="form-control track-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. REQ-12345"
                required
              />
              <button className="btn-primary-action" type="submit" disabled={loading}>
                {loading ? "Checking…" : "Check Status"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3>Request Details</h3>
              <span className={`status-badge status-${result.status}`}>
                {STATUS_LABELS[result.status] || result.status}
              </span>
            </div>
            
            <div className="fee-card">
              <h4 className="fee-card-title">Fee Breakdown</h4>
              <div className="fee-breakdown">
                <div className="fee-row">
                  <span>Government fee</span>
                  <span>{formatKES(result.government_fee || 0)}</span>
                </div>
                <div className="fee-row">
                  <span>Service fee</span>
                  <span>{formatKES(result.service_fee || 0)}</span>
                </div>
                <div className="fee-row fee-row-total">
                  <span>Total Amount</span>
                  <span>{formatKES(Number(result.government_fee || 0) + Number(result.service_fee || 0))}</span>
                </div>
              </div>
            </div>
            
            {/* Future Placeholder for Guest Chat System */}
            {result.status === 'awaiting_payment' && (
              <button className="btn-pay-now" onClick={() => alert('Payment gateway integration pending.')}>
                Proceed to Payment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}