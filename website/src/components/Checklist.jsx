import React, { useState } from 'react';

export default function Checklist() {
  const [hover, setHover] = useState(false);

  return (
    <section id="checklist" style={{
      padding: '64px 0',
      background: '#F8FAFC',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div className="container">
        <div className="checklist-teaser" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '32px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 12, fontWeight: 700,
              color: '#2E86DE', letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'rgba(46,134,222,0.08)',
              padding: '6px 14px', borderRadius: 100,
              marginBottom: 14,
            }}>
              Free Resource
            </div>
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 900, color: '#0A1628',
              letterSpacing: -0.6, lineHeight: 1.2,
              marginBottom: 10,
            }}>
              Gear Inventory &amp; Compliance Checklist
            </h2>
            <p style={{
              fontSize: 16, color: '#475569',
              lineHeight: 1.65, maxWidth: 560,
            }}>
              An interactive checklist built around NFPA 1850 to track every piece of PPE,
              plan inspections, and stay ahead of 10-year retirement deadlines. Available
              free inside the GearScanner app.
            </p>
          </div>

          <a
            href="https://app.gearscanner.net"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 30px',
              fontSize: 16, fontWeight: 700,
              background: hover ? '#1a6db5' : '#2E86DE',
              color: '#fff',
              borderRadius: 10,
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s',
              transform: hover ? 'translateY(-2px)' : 'none',
              boxShadow: hover ? '0 12px 32px rgba(46,134,222,0.4)' : '0 4px 16px rgba(46,134,222,0.25)',
            }}
          >
            Open the Checklist
            <ArrowIcon />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #checklist .checklist-teaser {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 28px 24px !important;
          }
          #checklist .checklist-teaser > a {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 640px) {
          #checklist { padding: 48px 0 !important; }
        }
      `}</style>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
