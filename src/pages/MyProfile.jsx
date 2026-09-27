import { useState } from "react";
import { useAuth } from "../AuthContext";
import { updateMyProfile, changeMyPassword } from "../api";
import "./MyProfile.css";

export default function MyProfile() {
  const { user } = useAuth();

  // Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [savedProfile, setSavedProfile] = useState({
    fullName: user?.full_name || "",
    phone: user?.phone_number || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const displayName = fullName.trim() || user?.full_name || "Staff member";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await updateMyProfile({ full_name: fullName, phone_number: phone });
      setSavedProfile({ fullName, phone });
      setProfileSuccess(true);
      setIsEditingProfile(false); // Switch back to read-only on success
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordSaving(true);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setIsEditingPassword(false); // Switch back to read-only on success
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        
        <header className="profile-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your personal information and security preferences.</p>
        </header>

        <section className="profile-identity-card" aria-label="Account overview">
          <div className="avatar-circle" aria-hidden="true">{initials}</div>
          <div className="identity-details">
            <h2 className="identity-name">{displayName}</h2>
            <span className="identity-email">{user?.email || "Staff account"}</span>
          </div>
          <div className="identity-role-badge">
            {user?.role || "Staff"}
          </div>
        </section>

        <div className="profile-grid">
          
          <section className="settings-card">
            <div className="settings-header">
              <div>
                <h2 className="settings-title">Personal Details</h2>
                <p className="settings-desc">Your contact information.</p>
              </div>
              {!isEditingProfile && (
                <button 
                  type="button"
                  className="btn-ghost-sm" 
                  onClick={() => setIsEditingProfile(true)}
                  aria-expanded={isEditingProfile}
                  aria-controls="profile-details-form"
                >
                  Edit
                </button>
              )}
            </div>

            {profileError && <div className="alert-box alert-error" role="alert">{profileError}</div>}
            {profileSuccess && !isEditingProfile && <div className="alert-box alert-success" role="status">Profile details updated successfully.</div>}

            {!isEditingProfile ? (
              <div className="read-only-data">
                <div className="data-row">
                  <span className="data-label">Full Name</span>
                  <span className="data-value">{fullName || "Not provided"}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Work Email</span>
                  <span className="data-value">{user?.email || "Not provided"}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Phone Number</span>
                  <span className="data-value">{phone || "Not provided"}</span>
                </div>
              </div>
            ) : (
              <form id="profile-details-form" className="settings-form" onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    autoComplete="name"
                    autoFocus
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setProfileSuccess(false); }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-email">Work Email</label>
                  <input 
                    id="profile-email" 
                    value={user?.email || ""} 
                    readOnly 
                    className="input-readonly"
                  />
                  <span className="field-note">Contact an administrator to change your email.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setProfileSuccess(false); }}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileError("");
                      // Reset to original values on cancel
                      setFullName(savedProfile.fullName);
                      setPhone(savedProfile.phone);
                    }}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>
                  <button className="btn-primary" type="submit" disabled={profileSaving}>
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="settings-card">
            <div className="settings-header">
              <div>
                <h2 className="settings-title">Security</h2>
                <p className="settings-desc">Manage your account access.</p>
              </div>
              {!isEditingPassword && (
                <button 
                  type="button"
                  className="btn-ghost-sm" 
                  onClick={() => setIsEditingPassword(true)}
                  aria-expanded={isEditingPassword}
                  aria-controls="password-change-form"
                >
                  Change password
                </button>
              )}
            </div>

            {passwordError && <div className="alert-box alert-error" role="alert">{passwordError}</div>}
            {passwordSuccess && !isEditingPassword && <div className="alert-box alert-success" role="status">Password changed successfully.</div>}

            {!isEditingPassword ? (
              <div className="security-summary">
                <span className="security-status-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>Password is private</strong>
                  <p>Your password is never shown here. Change it if you think someone else may know it.</p>
                </div>
              </div>
            ) : (
              <form id="password-change-form" className="settings-form" onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSuccess(false); }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(false); }}
                    required
                  />
                  <span className="field-note">Use at least 8 characters.</span>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordError("");
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    disabled={passwordSaving}
                  >
                    Cancel
                  </button>
                  <button className="btn-primary" type="submit" disabled={passwordSaving}>
                    {passwordSaving ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}