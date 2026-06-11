import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// ── Shared input styles (matches Contact.jsx) ───────────────────
const baseInput = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: '#0A1628',
  background: '#fff',
  border: '1.5px solid #E2E8F0',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

function focusedStyle(active) {
  return {
    ...baseInput,
    borderColor: active ? '#2E86DE' : '#E2E8F0',
    boxShadow:   active ? '0 0 0 3px rgba(46,134,222,0.12)' : 'none',
  };
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = ['#2E86DE', '#1A8A4A', '#D97706', '#C41E3A', '#7C3AED'];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('id, name, message, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(9);

      if (!cancelled) {
        if (!fetchError && data) setReviews(data);
        setLoading(false);
      }
    }

    loadReviews();
    return () => { cancelled = true; };
  }, []);

  const isValid = name.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase
      .from('reviews')
      .insert([{ name: name.trim(), message: message.trim(), approved: false }]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      setName('');
      setMessage('');
    }
    setSubmitting(false);
  };

  return (
    <section style={{
      padding: '96px 0',
      background: '#0A1628',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,134,222,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,134,222,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(46,134,222,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700,
            color: '#2E86DE', letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'rgba(46,134,222,0.12)',
            border: '1px solid rgba(46,134,222,0.25)',
            padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
          }}>
            Reviews
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: -1, lineHeight: 1.1,
            marginBottom: 16,
          }}>
            What Real Users Are Saying
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.55)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.6,
          }}>
            Used GearScanner at your department? We'd love to hear about it.
          </p>
        </div>

        {/* Review cards */}
        {!loading && reviews.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginBottom: 56,
          }}>
            {reviews.map((r, i) => (
              <div key={r.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '28px 26px',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Quote mark */}
                <div style={{
                  fontSize: 44, lineHeight: 0.8,
                  color: AVATAR_COLORS[i % AVATAR_COLORS.length], opacity: 0.4,
                  fontFamily: 'Georgia, serif',
                  marginBottom: 12,
                }}>"</div>

                <p style={{
                  fontSize: 15, color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.7,
                  flexGrow: 1, marginBottom: 24,
                }}>
                  {r.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {initials(r.name)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {r.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submission form */}
        <div style={{
          maxWidth: 560, margin: '0 auto',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '32px 28px',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(26,138,74,0.12)',
                border: '2px solid rgba(26,138,74,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 16px',
                color: '#3FBE74',
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Thanks for sharing!
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Your review has been submitted and will appear here once it's been reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 18 }}>
                Leave a Review
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)', marginBottom: 6,
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  style={focusedStyle(focused === 'name')}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)', marginBottom: 6,
                }}>
                  Your Review
                </label>
                <textarea
                  placeholder="Share your experience with GearScanner..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                  rows={4}
                  style={{
                    ...focusedStyle(focused === 'message'),
                    resize: 'vertical',
                    minHeight: 100,
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: '11px 14px',
                  background: 'rgba(196,30,58,0.1)',
                  border: '1px solid rgba(196,30,58,0.3)',
                  borderRadius: 8,
                  fontSize: 14, color: '#FF8FA3', fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isValid || submitting}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 16, fontWeight: 700,
                  color: '#fff',
                  background: '#2E86DE',
                  border: 'none',
                  borderRadius: 10,
                  cursor: (!isValid || submitting) ? 'not-allowed' : 'pointer',
                  opacity: (!isValid || submitting) ? 0.6 : 1,
                  transition: 'background 0.2s, opacity 0.2s',
                  letterSpacing: 0.2,
                }}
                onMouseEnter={e => { if (isValid && !submitting) e.currentTarget.style.background = '#1a6db5'; }}
                onMouseLeave={e => { if (isValid && !submitting) e.currentTarget.style.background = '#2E86DE'; }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > .container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          section:has(> .container) {
            padding: 64px 0 !important;
          }
          section > .container > div:last-child {
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
