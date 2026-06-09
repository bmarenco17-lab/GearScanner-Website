import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function LoginScreen({ onSignUp }) {
  const { login, resetPassword } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // AuthContext listener will update state — App re-renders automatically
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
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
        <h2 className="auth-heading">Sign In</h2>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {resetSent && !error && (
          <div className="auth-success">
            ✅ Password reset email sent — check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@department.gov"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-auth-primary"
            disabled={loading || !email || !password}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <button
          type="button"
          className="auth-link"
          onClick={handleForgot}
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      {/* ── Sign-up prompt ── */}
      <div className="auth-footer">
        New department?{' '}
        <button className="auth-link-inline" onClick={onSignUp}>
          Create an account
        </button>
      </div>

      {/* ── Demo hint ── */}
      <div className="auth-demo-hint">
        Try the demo: <strong>demogearscanner@gmail.com</strong> / <strong>demo1234</strong>
      </div>
    </div>
  );
}

// ── Firebase error → human-readable ─────────────────────────
function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}
