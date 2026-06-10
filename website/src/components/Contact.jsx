import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY  = 'nWsQIee18a2NgfIvg';
const EMAILJS_SERVICE_ID  = 'service_3w32ymp';
const EMAILJS_TEMPLATE_ID = 'template_q7arnrb';

// ── Shared input styles ────────────────────────────────────────
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

function Field({ label, optional, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: '#374151', marginBottom: 6, letterSpacing: 0.1,
      }}>
        {label}
        {optional && (
          <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function Contact() {
  const formRef  = useRef(null);
  const [focused,    setFocused]    = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // Controlled values (for validation only — names on inputs drive EmailJS)
  const [vals, setVals] = useState({
    first_name: '', last_name: '', email: '',
    department_name: '', phone: '', stations: '', message: '',
  });

  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }));
  const f   = (k) => () => setFocused(k);
  const b   = ()  => setFocused('');

  const isValid = vals.first_name && vals.last_name &&
                  vals.email && vals.department_name && vals.stations;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY,
      );
      setSubmitted(true);
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{
      padding: '96px 0',
      background: '#F8FAFC',
      borderTop: '1px solid #E2E8F0',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: 64,
          alignItems: 'start',
        }}>

          {/* ── Left: copy ── */}
          <div style={{ paddingTop: 8 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 12, fontWeight: 700,
              color: '#2E86DE', letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'rgba(46,134,222,0.08)',
              padding: '6px 14px', borderRadius: 100,
              marginBottom: 20,
            }}>
              Contact
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 900, color: '#0A1628',
              letterSpacing: -1, lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Request a Demo
            </h2>
            <p style={{
              fontSize: 17, color: '#475569',
              lineHeight: 1.7, marginBottom: 36,
            }}>
              Fill out the form and we'll be in touch within 24 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { num: '01', text: 'Personalized walkthrough of every feature' },
                { num: '02', text: 'See how GearScanner fits your department' },
                { num: '03', text: 'No pressure — just a live demo' },
              ].map(item => (
                <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#0A1628',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 0.3 }}>
                      {item.num}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.55, paddingTop: 8 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Direct email */}
            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #E2E8F0',
            }}>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>
                Prefer email?
              </p>
              <a href="mailto:info@gearscanner.net" style={{
                fontSize: 16, fontWeight: 700, color: '#2E86DE',
                textDecoration: 'none',
              }}>
                info@gearscanner.net
              </a>
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: '40px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            {submitted ? (
              <ThankYou />
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate>

                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <Field label="First Name">
                    <input
                      name="first_name"
                      type="text"
                      placeholder="Jane"
                      value={vals.first_name}
                      onChange={set('first_name')}
                      onFocus={f('first_name')}
                      onBlur={b}
                      style={focusedStyle(focused === 'first_name')}
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      name="last_name"
                      type="text"
                      placeholder="Smith"
                      value={vals.last_name}
                      onChange={set('last_name')}
                      onFocus={f('last_name')}
                      onBlur={b}
                      style={focusedStyle(focused === 'last_name')}
                    />
                  </Field>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                  <Field label="Email Address">
                    <input
                      name="email"
                      type="email"
                      placeholder="jane@yourfire.gov"
                      value={vals.email}
                      onChange={set('email')}
                      onFocus={f('email')}
                      onBlur={b}
                      style={focusedStyle(focused === 'email')}
                    />
                  </Field>
                </div>

                {/* Department */}
                <div style={{ marginBottom: 20 }}>
                  <Field label="Department Name">
                    <input
                      name="department_name"
                      type="text"
                      placeholder="Riverside Fire Department"
                      value={vals.department_name}
                      onChange={set('department_name')}
                      onFocus={f('department_name')}
                      onBlur={b}
                      style={focusedStyle(focused === 'department_name')}
                    />
                  </Field>
                </div>

                {/* Phone + Stations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <Field label="Phone Number" optional>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={vals.phone}
                      onChange={set('phone')}
                      onFocus={f('phone')}
                      onBlur={b}
                      style={focusedStyle(focused === 'phone')}
                    />
                  </Field>
                  <Field label="Number of Stations">
                    <select
                      name="stations"
                      value={vals.stations}
                      onChange={set('stations')}
                      onFocus={f('stations')}
                      onBlur={b}
                      style={{
                        ...focusedStyle(focused === 'stations'),
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        paddingRight: 36,
                        cursor: 'pointer',
                        color: vals.stations ? '#0A1628' : '#9CA3AF',
                      }}
                    >
                      <option value="" disabled>Select...</option>
                      <option value="1 station">1 station</option>
                      <option value="2-3 stations">2–3 stations</option>
                      <option value="4-10 stations">4–10 stations</option>
                      <option value="10+ stations">10+ stations</option>
                    </select>
                  </Field>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 28 }}>
                  <Field label="Questions or Comments" optional>
                    <textarea
                      name="message"
                      placeholder="Tell us about your department or any questions you have..."
                      value={vals.message}
                      onChange={set('message')}
                      onFocus={f('message')}
                      onBlur={b}
                      rows={3}
                      style={{
                        ...focusedStyle(focused === 'message'),
                        resize: 'vertical',
                        minHeight: 88,
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.6,
                      }}
                    />
                  </Field>
                </div>

                {/* Error message */}
                {error && (
                  <div style={{
                    marginBottom: 16,
                    padding: '11px 14px',
                    background: '#FFF0F3',
                    border: '1px solid rgba(196,30,58,0.25)',
                    borderRadius: 8,
                    fontSize: 14, color: '#C41E3A', fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: 16, fontWeight: 700,
                    color: '#fff',
                    background: '#2E86DE',
                    border: 'none',
                    borderRadius: 10,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.85 : 1,
                    transition: 'background 0.2s',
                    letterSpacing: 0.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#1a6db5'; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#2E86DE'; }}
                >
                  {submitting ? <><Spinner /> Sending...</> : 'Request My Demo'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#94A3B8' }}>
                  No contracts. Cancel anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #contact .container > div {
            grid-template-columns: 1fr !important;
          }
          #contact .container > div > div:first-child {
            padding-top: 0 !important;
          }
        }
        @media (max-width: 480px) {
          #contact .container > div > div:last-child {
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── Thank-you state ─────────────────────────────────────────────
function ThankYou() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(26,138,74,0.1)',
        border: '2px solid rgba(26,138,74,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 8,
      }}>
        ✓
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0A1628', letterSpacing: -0.4 }}>
        You're all set!
      </h3>
      <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.65, maxWidth: 320 }}>
        Thank you! We'll be in touch within 24 hours to schedule your personalized demo.
      </p>
    </div>
  );
}

// ── Loading spinner ─────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes gs-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 16, height: 16,
        border: '2px solid rgba(255,255,255,0.35)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'gs-spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
    </>
  );
}
