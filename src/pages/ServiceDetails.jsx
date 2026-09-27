import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../api"; //[cite: 1]
import "./ServiceDetails.css";

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    
    getServiceById(id) //[cite: 1]
      .then((data) => {
        if (isMounted) setService(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-status-container">
        <p className="catalog-status" aria-live="polite">Loading service details…</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="detail-page detail-error-page">
        <p className="catalog-status form-error" aria-live="assertive">
          This service couldn't be found. It may have been removed.
        </p>
        {/* FIXED: This should navigate back to the catalog ("/") */}
        <button className="btn-secondary" onClick={() => navigate("/")}>
          Back to services
        </button>
      </div>
    );
  }

  const govFee = Number(service.estimated_government_fee || 0);
  const serviceFee = Number(service.estimated_service_fee || 0);
  const total = govFee + serviceFee;

  return (
    <div className="detail-page">
      <nav className="detail-nav">
        <button className="link-back" onClick={() => navigate("/")}>
          ← Back to services
        </button>
      </nav>

      <div className="detail-content-wrapper">
        <div className="detail-main">
          <span className="detail-category">
            {service.category ? service.category.replace("_", " ") : "Service"}
          </span>
          <h1 className="detail-title">{service.name}</h1>
          <p className="detail-description">{service.description}</p>

          {service.requires_physical_visit && (
            <div className="notice-box">
              <div className="notice-icon">⚠️</div>
              <div className="notice-text">
                <strong>Physical visit required.</strong> 
                <p>You can start this application online, but you'll need to visit the café in person to complete it. Bring your national ID and any relevant documents.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="detail-sidebar">
          <div className="fee-card">
            <h3>Estimated Costs</h3>
            <div className="fee-breakdown">
              <div className="fee-row">
                <span>Government fee</span>
                <span>{formatKES(govFee)}</span>
              </div>
              <div className="fee-row">
                <span>Service fee</span>
                <span>{formatKES(serviceFee)}</span>
              </div>
              <div className="fee-row fee-row-total">
                <span>Total estimate</span>
                <span>{formatKES(total)}</span>
              </div>
            </div>
            
            {/* UPDATED: Now navigates to the apply form for this specific service ID */}
            <button
              className="btn-primary-apply"
              onClick={() => navigate(`/services/${id}/apply`)}
            >
              Apply for this service
            </button>
            
          </div>
        </aside>
      </div>
    </div>
  );
}