import "./DynamicFormField.css";

export default function DynamicFormField({ field, value, onChange }) {
  // Added `placeholder` to the destructured props for better UX
  const { key, label, type, required, options, placeholder } = field;

  return (
    <div className="form-field-group">
      <label htmlFor={key} className="form-field-label">
        {label}
        {required && (
          <span className="required-asterisk" aria-hidden="true" title="Required">
            *
          </span>
        )}
      </label>

      {type === "textarea" ? (
        <textarea
          id={key}
          className="form-control"
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(key, e.target.value)}
          required={required}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
      ) : type === "select" ? (
        <div className="select-wrapper">
          <select
            id={key}
            className="form-control form-select"
            value={value || ""}
            onChange={(e) => onChange(key, e.target.value)}
            required={required}
          >
            <option value="" disabled>
              Select {label.toLowerCase()}
            </option>
            {(options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input
          id={key}
          className="form-control"
          type={type === "number" ? "number" : "text"}
          value={value || ""}
          onChange={(e) =>
            onChange(key, type === "number" ? e.target.valueAsNumber : e.target.value)
          }
          required={required}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          min={type === "number" ? 0 : undefined}
        />
      )}
    </div>
  );
}