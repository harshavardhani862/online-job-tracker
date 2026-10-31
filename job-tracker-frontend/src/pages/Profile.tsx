import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getProfile, updateProfile } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/User";

type ProfileForm = User & { newPassword: string; confirmPassword: string };

const emptyProfile: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  subscriptionStatus: "FREE",
  newPassword: "",
  confirmPassword: "",
};

export default function Profile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [original, setOriginal] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        setOriginal(data);
        setProfile({ ...emptyProfile, ...data, newPassword: "", confirmPassword: "" });
      })
      .catch(() => {
        if (active) setError("We couldn't load your profile. Please check that the backend is running and try again.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const initials = useMemo(() => {
    const parts = (profile.name || "U").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  }, [profile.name]);

  const startEditing = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (original) setProfile({ ...emptyProfile, ...original, newPassword: "", confirmPassword: "" });
    setEditing(false);
    setError("");
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile.name.trim()) return setError("Please enter your full name.");
    if (profile.phone && !/^[+\d\s()-]{7,20}$/.test(profile.phone.trim())) {
      return setError("Please enter a valid phone number.");
    }
    if (profile.newPassword && profile.newPassword.length < 8) {
      return setError("Your new password must contain at least 8 characters.");
    }
    if (profile.newPassword !== profile.confirmPassword) {
      return setError("The new password and confirmation do not match.");
    }

    setSaving(true);
    try {
      const payload: Partial<User> & { password?: string } = {
        name: profile.name.trim(),
        phone: profile.phone?.trim() || "",
      };
      if (profile.newPassword) payload.password = profile.newPassword;
      const updated = await updateProfile(payload);
      setOriginal(updated);
      setProfile({ ...emptyProfile, ...updated, newPassword: "", confirmPassword: "" });
      refreshUser(updated);
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading your profile…</div>;

  return (
    <main className="profile-page">
      <header className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>View and manage your personal account information.</p>
        </div>
        {!editing && <button type="button" className="profile-primary-btn" onClick={startEditing}>✎ Edit profile</button>}
      </header>

      {error && <div className="profile-alert profile-alert-error" role="alert">{error}</div>}
      {success && <div className="profile-alert profile-alert-success" role="status">{success}</div>}

      <section className="profile-hero-card">
        <div className="profile-avatar" aria-label="Profile initials">{initials || "U"}</div>
        <div className="profile-hero-copy">
          <h2>{profile.name || "Your name"}</h2>
          <p>{profile.email}</p>
          <span className={`profile-plan-pill ${profile.subscriptionStatus === "PREMIUM" ? "premium" : ""}`}>
            {profile.subscriptionStatus || "FREE"} PLAN
          </span>
        </div>
        <div className="profile-member-note"><span>✓</span> Job Tracker member</div>
      </section>

      <form onSubmit={save}>
        <section className="profile-panel">
          <div className="profile-panel-heading">
            <div><h3>Personal information</h3><p>Your basic details used in your account.</p></div>
            {!editing && <span className="profile-view-label">VIEW MODE</span>}
          </div>
          <div className="profile-fields-grid">
            <label className="profile-field">
              <span>Full name</span>
              <input value={profile.name} disabled={!editing} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your full name" />
            </label>
            <label className="profile-field">
              <span>Email address</span>
              <input type="email" value={profile.email} disabled readOnly />
              <small>Email address cannot be changed here.</small>
            </label>
            <label className="profile-field">
              <span>Phone number</span>
              <input type="tel" value={profile.phone || ""} disabled={!editing} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Add your phone number" />
            </label>
            <label className="profile-field">
              <span>Subscription plan</span>
              <input value={profile.subscriptionStatus || "FREE"} disabled readOnly />
            </label>
          </div>
        </section>

        {editing && (
          <section className="profile-panel">
            <div className="profile-panel-heading"><div><h3>Account security</h3><p>Set a new password. Leave both fields blank to keep your current password.</p></div></div>
            <div className="profile-fields-grid">
              <label className="profile-field"><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={profile.newPassword} onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} placeholder="At least 8 characters" /></label>
              <label className="profile-field"><span>Confirm new password</span><input type="password" autoComplete="new-password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} placeholder="Re-enter new password" /></label>
            </div>
          </section>
        )}

        <section className="profile-panel profile-account-panel">
          <div className="profile-panel-heading"><div><h3>Account overview</h3><p>A quick summary of your Job Tracker account.</p></div></div>
          <div className="profile-overview-grid">
            <div><span>Account ID</span><strong>{profile.id ?? profile.userId ?? "—"}</strong></div>
            <div><span>Membership</span><strong>{profile.subscriptionStatus || "FREE"}</strong></div>
            <div><span>Profile status</span><strong className="profile-active-status">● Active</strong></div>
          </div>
        </section>

        {editing && <div className="profile-form-actions"><button type="button" className="profile-secondary-btn" onClick={cancelEditing} disabled={saving}>Cancel</button><button type="submit" className="profile-primary-btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>}
      </form>
      <p className="profile-footnote">Your profile details are private to your account. Keep your password confidential.</p>
    </main>
  );
}
