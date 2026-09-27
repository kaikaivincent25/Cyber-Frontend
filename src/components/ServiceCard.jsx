import "./ServiceCard.css";

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

const categoryIcons = {
  kra_services: "receipt",
  business_registration: "briefcase",
  immigration: "passport",
  driving: "car",
  ntsa_services: "car",
  birth_certificate: "file",
  land_services: "home",
  health_services: "heart",
  education: "graduation",
  government_services: "building",
};

function CategoryIcon({ category }) {
  const icon = categoryIcons[category];

  if (icon === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (icon === "car") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 17 1.5-6h11L19 17" />
        <path d="M3 17h18v3H3z" />
        <circle cx="7" cy="18" r="1" />
        <circle cx="17" cy="18" r="1" />
      </svg>
    );
  }

  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  // Generic government/service icon
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V9h14v12" />
      <path d="M3 9h18L12 3 3 9Z" />
      <path d="M8 13v4M12 13v4M16 13v4" />
    </svg>
  );
}

export default function ServiceCard({ service, onClick }) {
  const totalEstimate =
    Number(service.estimated_government_fee || 0) +
    Number(service.estimated_service_fee || 0);

  const formatCategory = (category) =>
    category
      ? category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Government Service";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className="service-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.name}`}
    >
      {/* Top section */}
      <div className="service-card__top">
        <div className="service-card__category">
          <div className="service-card__icon">
            <CategoryIcon category={service.category} />
          </div>

          <span>{formatCategory(service.category)}</span>
        </div>

        {service.requires_physical_visit && (
          <span
            className="service-card__visit"
            title="Physical presence is required"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            In-person
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="service-card__content">
        <h3 className="service-card__title">{service.name}</h3>

        <p className={`service-card__description ${!service.description ? "is-empty" : ""}`}>
          {service.description ||
            "Standard processing available. View the service for requirements and application steps."}
        </p>
      </div>

      {/* Bottom section */}
      <div className="service-card__bottom">
        <div className="service-card__pricing">
          <span className="service-card__price-label">
            Estimated total
          </span>

          <strong className="service-card__price">
            {formatKES(totalEstimate)}
          </strong>
        </div>

        <div className="service-card__arrow" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </div>
      </div>
    </article>
  );
}