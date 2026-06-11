import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

// ── Set Password screen ─────────────────────────────────────────
// Shown when a user arrives via a Supabase "invite" or
// "password recovery" email link (redirected to /set-password with
// auth tokens in the URL hash). supabase-js automatically exchanges
// those tokens for a session (detectSessionInUrl: true), so by the
// time this screen mounts, supabase.auth.getSession() should resolve
// to that user's session.
export default function SetPasswordScreen() {
  const [checking, setChecking] = useState(true);
  const [session,  setSession]  = useState(null);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not set your password. Please try the invite link again.');
    } finally {
      setSaving(false);
    }
  }

  const meta = session?.user?.user_metadata || {};

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
        <h2 className="auth-heading">Set Your Password</h2>

        {checking ? (
          <p style={{ fontSize: 14, color: '#4A5568' }}>Verifying your invite link…</p>
        ) : !session ? (
          <div className="auth-error">
            <span>⚠️</span> This link is invalid or has expired. Please ask GearScanner to
            send a new invite, or use "Forgot password" on the sign-in screen.
          </div>
        ) : done ? (
          <>
            <div className="auth-success">
              ✅ Your password has been set. You can now sign in with your email and new
              password.
            </div>
            <a href="/" className="btn btn-auth-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Go to Sign In →
            </a>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#4A5568', marginBottom: 16, lineHeight: 1.6 }}>
              Welcome{meta.departmentName ? `, ${meta.departmentName}` : ''}! Choose a
              password for <strong>{session.user.email}</strong> to finish setting up your
              account.
            </p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="sp-password">New Password</label>
                <input
                  id="sp-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>

              <div className="field">
                <label htmlFor="sp-confirm">Confirm Password</label>
                <input
                  id="sp-confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                className="btn btn-auth-primary"
                disabled={saving || !password || !confirm}
              >
                {saving ? 'Saving…' : 'Set Password →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
