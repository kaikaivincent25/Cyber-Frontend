import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById, submitRequest } from "../api"; //[cite: 1]
import DynamicFormField from "../components/DynamicFormField";
import "./ServiceApply.css";

export default function ServiceApply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [formData, setFormData] = useState({});

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getServiceById(id) //[cite: 1]
      .then((data) => {
        if (isMounted) setService(data);
      })
      .catch((err) => {
        if (isMounted) setLoadError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [id]);

  function handleFieldChange(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    
    try {
      const response = await submitRequest({ //[cite: 1]
        service_id: Number(id),
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || null,
        form_data: formData,
      });
      setResult(response);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="apply-status-container"><p className="catalog-status">Loading application…</p></div>;
  }
  
  if (loadError || !service) {
    return <div className="apply-status-container"><p className="catalog-status form-error">{loadError || "Service not found."}</p></div>;
  }

  if (result) {
    return (
      <div className="apply-page-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1 className="detail-title">Request Submitted Successfully</h1>
          <p className="detail-description">{result.message}</p>
          
          <div className="tracking-code-box">
            <p className="tracking-code-label">Your Unique Tracking Code</p>
            <p className="tracking-code-value">{result.tracking_code}</p>
            <small>Please save this code to check your request status later.</small>
          </div>
          
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate("/track")}>
              Track Status Now
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page-container">
      <nav className="apply-nav">
        <button className="link-back" onClick={() => navigate(`/services/${id}`)}>
          ← Back to {service.name} details
        </button>
      </nav>

      <div className="apply-card">
        <header className="apply-header">
          <h1 className="apply-title">Apply for {service.name}</h1>
          <p className="apply-subtitle">Please fill out the details below to initiate your request.</p>
        </header>

        {submitError && (
          <div className="alert-error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="apply-form">
          <fieldset className="form-section">
            <legend>Personal Information</legend>
            
            <div className="form-grid-2">
              <div className="form-field-group">
                <label htmlFor="guestName" className="form-field-label">Full Name <span className="required-asterisk">*</span></label>
                <input 
                  id="guestName" 
                  className="form-control"
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  required 
                  placeholder="Kaikai Vincent"
                />
              </div>
              
              <div className="form-field-group">
                <label htmlFor="guestPhone" className="form-field-label">Phone Number <span className="required-asterisk">*</span></label>
                <input 
                  id="guestPhone" 
                  className="form-control"
                  type="tel"
                  value={guestPhone} 
                  onChange={(e) => setGuestPhone(e.target.value)} 
                  required 
                  placeholder="e.g. 0712345678"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="guestEmail" className="form-field-label">Email Address (Optional)</label>
              <input 
                id="guestEmail" 
                className="form-control"
                type="email" 
                value={guestEmail} 
                onChange={(e) => setGuestEmail(e.target.value)} 
                placeholder="kaikaivincent24@gmail.com"
              />
            </div>
          </fieldset>

          {service.form_schema && service.form_schema.length > 0 && (
            <fieldset className="form-section">
              <legend>Service Requirements</legend>
              {service.form_schema.map((field) => (
                <DynamicFormField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
            </fieldset>
          )}

          <div className="form-actions">
            <button className="btn-submit-large" type="submit" disabled={submitting}>
              {submitting ? "Submitting Request…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}