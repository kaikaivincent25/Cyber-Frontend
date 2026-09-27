import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../api"; 
import ServiceCard from "../components/ServiceCard";
import "./Home.css";

export default function Home() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // isMounted prevents state updates if the component unmounts before the fetch completes
    let isMounted = true; 

    getServices()
      .then((data) => {
        if (isMounted) setServices(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load services.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Early returns for Loading and Error states
  if (loading) {
    return <div className="loader" aria-live="polite">Loading services...</div>;
  }

  if (error) {
    return <div className="error-msg" aria-live="assertive">{error}</div>;
  }

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">Simple help. Real progress.</span>
          <h1>Digital services, made easier.</h1>
          <p>
            Get the support you need from your local Cyber Café. Start online,
            stay informed, and let us help you get things done.
          </p>
        </div>
        
        <div className="hero-actions">
          <button className="btn-primary-home" onClick={() => navigate("/track")}>
            Track a request <span aria-hidden="true">→</span>
          </button>
          <button className="btn-quiet-home" onClick={() => navigate("/login")}>
            Staff access
          </button>
        </div>

        <div className="hero-trust-row" aria-label="Service benefits">
          <span><strong>01</strong> Browse services</span>
          <span><strong>02</strong> Apply online</span>
          <span><strong>03</strong> Track progress</span>
        </div>
      </header>

      <main>
        {services.length === 0 ? (
          <p className="status-msg">
            No services are currently available. Please check back shortly.
          </p>
        ) : (
          <section className="services-section" aria-labelledby="services-heading">
            <div className="services-heading-row">
              <div>
                <span className="section-eyebrow">Explore our services</span>
                <h2 id="services-heading">What can we help you with?</h2>
              </div>
              <span className="services-count">{services.length} services available</span>
            </div>
            <div className="services-grid">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => navigate(`/services/${service.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}