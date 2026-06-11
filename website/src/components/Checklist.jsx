import React, { useState } from 'react';

const included = [
  'PPE ensemble inventory table (helmet, hood, coat, pants, gloves, boots, SCBA & PASS)',
  'Routine inspection checklist (after every use / monthly)',
  'Advanced cleaning & inspection checklist (annual)',
  'Department-wide NFPA 1850 program compliance checklist',
];

export default function Checklist() {
  const [hover, setHover] = useState(false);

  return (
    <section id="checklist" style={{
      padding: '96px 0',
      background: '#F8FAFC',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '50%', right: -120,
        transform: 'translateY(-50%)',
        width: 360, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,134,222,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">
        <div className="checklist-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 56,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left: copy */}
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: 12, fontWeight: 700,
              color: '#2E86DE', letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'rgba(46,134,222,0.08)',
              padding: '6px 14px', borderRadius: 100,
              marginBottom: 16,
            }}>
              Free Resource
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 46px)',
              fontWeight: 900, color: '#0A1628',
              letterSpacing: -1, lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Gear Inventory &amp; Compliance Checklist
            </h2>
            <p style={{
              fontSize: 17, color: '#475569',
              lineHeight: 1.7, marginBottom: 28,
              maxWidth: 480,
            }}>
              Download a free, printable checklist built around NFPA 1850 to track every
              piece of PPE, plan inspections, and stay ahead of 10-year retirement deadlines —
              whether or not you're using GearScanner.
            </p>

            <ul style={{ listStyle: 'none', marginBottom: 32 }}>
              {included.map(item => (
                <li key={item} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: 15, color: '#334155',
                  marginBottom: 12, lineHeight: 1.55,
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(26,138,74,0.12)',
                    color: '#1A8A4A', fontWeight: 900, fontSize: 12,
                    flexShrink: 0, marginTop: 1,
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="/gearscanner-nfpa1850-checklist.pdf"
              download="GearScanner-NFPA-1850-Gear-Inventory-Checklist.pdf"
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
                transition: 'all 0.2s',
                transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? '0 12px 32px rgba(46,134,222,0.4)' : '0 4px 16px rgba(46,134,222,0.25)',
              }}
            >
              <DownloadIcon />
              Download Free PDF Checklist
            </a>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 12 }}>
              Free PDF • No email required • 3 pages
            </p>
          </div>

          {/* Right: document preview card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%', maxWidth: 340,
            }}>
              {/* Back sheet */}
              <div style={{
                position: 'absolute', top: 18, left: 18,
                width: '100%', height: '100%',
                background: '#0D2040',
                borderRadius: 14,
                opacity: 0.12,
              }} />
              {/* Document card */}
              <div style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 60px rgba(10,22,40,0.12)',
                padding: '28px 26px',
                minHeight: 420,
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Header bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E2E8F0',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#2E86DE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>GS</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0A1628', letterSpacing: 1 }}>
                    GEARSCANNER
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 10, fontWeight: 700, color: '#2E86DE',
                    background: 'rgba(46,134,222,0.1)',
                    padding: '4px 8px', borderRadius: 100,
                    letterSpacing: 0.5,
                  }}>
                    NFPA 1850
                  </span>
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: '#2E86DE', letterSpacing: 2, marginBottom: 6 }}>
                  CHECKLIST PREVIEW
                </div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#0A1628', marginBottom: 18, lineHeight: 1.3 }}>
                  Gear Inventory &amp; Compliance Checklist
                </div>

                {/* Mock checklist lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 }}>
                  {[
                    'PPE Ensemble Element Inventory',
                    'Routine Inspection (Monthly)',
                    'Advanced Cleaning & Inspection',
                    'Program Compliance',
                  ].map((label, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: '1.5px solid #CBD5E0',
                        flexShrink: 0,
                      }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 4 }}>
                          {i + 1}. {label}
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: '#F1F5F9', width: '90%' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* PDF tag */}
                <div style={{
                  marginTop: 20, paddingTop: 16,
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    background: '#C41E3A',
                    color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 8px', borderRadius: 4,
                    letterSpacing: 0.5,
                  }}>PDF</div>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>3 pages • Printable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #checklist .checklist-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          #checklist .checklist-grid > div:last-child {
            order: -1;
          }
        }
        @media (max-width: 640px) {
          #checklist { padding: 64px 0 !important; }
        }
      `}</style>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
