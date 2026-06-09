import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function SignUpScreen({ onBack }) {
  const { signup } = useAuth();

  const [form, setForm] = useState({
    departmentName: '',
    stationName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.departmentName.trim()) { setError('Department name is required.'); return; }
    if (!form.email.trim())          { setError('Email is required.'); return; }
    if (form.password.length < 6)    { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await signup(form.email.trim(), form.password, form.departmentName.trim(), form.stationName.trim());
      // AuthContext listener will navigate to app automatically
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* ── Branding ── */}
      <div className="auth-brand">
        <div className="auth-shield">🛡️</div>
        <div className="auth-brand-text">
          <div className="auth-brand-sub">Fire Department Gear Management</div>
          <div className="auth-brand-title">GearScanner</div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="auth-card">
        <h2 className="auth-heading">Create Department Account</h2>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="su-dept">Department Name *</label>
            <input
              id="su-dept"
              type="text"
              placeholder="Riverside Fire Department"
              value={form.departmentName}
              onChange={set('departmentName')}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="su-station">Primary Station Name</label>
            <input
              id="su-station"
              type="text"
              placeholder="Station 1"
              value={form.stationName}
              onChange={set('stationName')}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="su-email">Email Address *</label>
            <input
              id="su-email"
              type="email"
              placeholder="admin@yourdepartment.gov"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="su-password">Password *</label>
            <input
              id="su-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="su-confirm">Confirm Password *</label>
            <input
              id="su-confirm"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-auth-primary"
            disabled={loading || !form.departmentName || !form.email || !form.password}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <button
          type="button"
          className="auth-link"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Could not create account. Please try again.';
  }
}
