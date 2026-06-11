import React, { useState, useEffect, useRef } from 'react';

const PASSWORD = 'GearScanner2026';
const SESSION_KEY = 'gs_unlocked';

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <div style={{
        fontSize: 88, fontWeight: 700, color: '#fff',
        letterSpacing: -2, lineHeight: 1, marginBottom: 8,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {time}
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
        {date}
      </div>
    </div>
  );
}

export default function LockScreen({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `
        linear-gradient(rgba(10,22,40,0.55), rgba(10,22,40,0.75)),
        url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400) center/cover
      `,
      padding: 24,
    }}>
      <Clock />

      {/* Shield logo */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>GS</span>
      </div>

      <p style={{
        fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
        marginBottom: 20, letterSpacing: 0.2,
      }}>
        Enter password to unlock
      </p>

      <form onSubmit={submit} style={{
        animation: shake ? 'gs-shake 0.4s' : 'none',
      }}>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          style={{
            width: 240,
            padding: '14px 18px',
            fontSize: 17,
            fontFamily: 'Inter, sans-serif',
            color: '#fff',
            background: 'rgba(255,255,255,0.12)',
            border: error ? '1.5px solid #FF4D6D' : '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 14,
            outline: 'none',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            letterSpacing: 2,
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
        />

        <div style={{ height: 28, marginTop: 12, textAlign: 'center' }}>
          {error && (
            <span style={{ fontSize: 13, color: '#FF8FA3', fontWeight: 500 }}>
              Incorrect password. Try again.
            </span>
          )}
        </div>

        <button
          type="submit"
          style={{
            display: 'block',
            margin: '4px auto 0',
            padding: '12px 32px',
            fontSize: 15, fontWeight: 700,
            color: '#0A1628',
            background: '#fff',
            border: 'none',
            borderRadius: 100,
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          Unlock
        </button>
      </form>

      <style>{`
        @keyframes gs-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}
