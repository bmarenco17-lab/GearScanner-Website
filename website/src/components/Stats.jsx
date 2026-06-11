import React from 'react';

const stats = [
  { value: 'Seconds', label: 'AI Label Scanning' },
  { value: 'NFPA 1850', label: 'Compliant Tracking' },
  { value: '10-Year', label: 'Retirement Alerts' },
  { value: '100%', label: 'Cloud Synced' },
];

export default function Stats() {
  return (
    <section style={{
      background: '#0D2040',
      borderTop: '1px solid rgba(46,134,222,0.2)',
      borderBottom: '1px solid rgba(46,134,222,0.2)',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            padding: '32px 24px',
            textAlign: 'center',
            borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 900,
              color: '#2E86DE',
              letterSpacing: -0.5,
              lineHeight: 1,
              marginBottom: 6,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
              letterSpacing: 0.3,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
}
