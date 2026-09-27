import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Login.css";

const ERROR_MESSAGE =
  "We couldn't sign you in. Check your email and password, then try again.";
const OFFLINE_MESSAGE = "You're offline. Check your connection, then try again.";

// Decorative café floor: 12 stations, a few lit. Purely visual (aria-hidden).
const STATION_COUNT = 12;
const LIT_STATIONS = new Set([1, 6, 8]);

function EyeIcon({ off }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const passwordRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // Deliberately generic: never reveal which field was wrong.
      setError(navigator.onLine ? ERROR_MESSAGE : OFFLINE_MESSAGE);
      // Keep the email, put the cursor back where the fix happens.
      passwordRef.current?.focus();
      passwordRef.current?.select();
    } finally {
      setIsLoading(false);
    }
  };

  const checkCapsLock = (e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false);

  const describedBy =
    [error && "login-error", capsOn && "login-caps"].filter(Boolean).join(" ") ||
    undefined;

  return (
    <main className="login-page">
      <aside className="login-brand">
        <p className="login-wordmark">Cyber Café</p>

        <div className="login-floor" aria-hidden="true">
          {Array.from({ length: STATION_COUNT }, (_, i) => (
            <span
              key={i}
              className={`login-station${LIT_STATIONS.has(i) ? " is-lit" : ""}`}
            />
          ))}
        </div>

        <p className="login-brand-note">Staff access only</p>
      </aside>

      <section className="login-panel">
        <div className="login-panel-inner">
          <h1 className="login-title">Sign in</h1>
          <p className="login-lede">Use your staff email to open the dashboard.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div id="login-error" className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="kaikaivincent24@gmail.com"
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-password">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onBlur={() => setCapsOn(false)}
                  required
                  autoComplete="current-password"
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={describedBy}
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Show password"
                  aria-pressed={showPassword}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {capsOn && (
                <p id="login-caps" className="login-hint" role="status">
                  Caps Lock is on.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="login-note">On a shared computer? Sign out when your shift ends.</p>
        </div>
      </section>
    </main>
  );
}