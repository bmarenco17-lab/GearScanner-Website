import React from 'react';

function ShieldLogo() {
  return (
    <svg width="30" height="34" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 1L34 7.5V20C34 29.5 26.5 37 18 39.5C9.5 37 2 29.5 2 20V7.5L18 1Z" fill="#2E86DE" />
      <path d="M18 5L30 10.5V20C30 27.5 24.5 34 18 36.5C11.5 34 6 27.5 6 20V10.5L18 5Z" fill="#0A1628" />
      <text x="18" y="25" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="11" fill="white" letterSpacing="0.5">GS</text>
    </svg>
  );
}

const footerLinks = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Demo', 'Changelog', 'Roadmap'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'NFPA 1850 Guide', 'Help Center', 'API Docs', 'Status'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Security', 'Cookies'],
  },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#060E1A',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: 64,
    }}>
      <div className="container">
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldLogo />
              <span style={{
                fontSize: 18, fontWeight: 900, color: '#fff',
                letterSpacing: 1.5, textTransform: 'uppercase',
              }}>
                Gear<span style={{ color: '#2E86DE' }}>Scanner</span>
              </span>
            </div>
            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.7, maxWidth: 280, marginBottom: 16,
            }}>
              AI-powered PPE management for fire departments. Stay NFPA compliant,
              track retirements automatically, and protect every firefighter.
            </p>
            <a href="mailto:gearscanner@outlook.com" style={{
              display: 'inline-block',
              fontSize: 14, fontWeight: 600, color: '#2E86DE',
              textDecoration: 'none', marginBottom: 20,
            }}>
              gearscanner@outlook.com
            </a>
            {/* Social links */}
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'in', '📧'].map((s, i) => (
                <a key={i} href="#" style={{
                  width: 34, height: 34,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 700,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,134,222,0.15)'; e.currentTarget.style.color = '#2E86DE'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(col => (
            <div key={col.heading}>
              <div style={{
                fontSize: 11, fontWeight: 800,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: 2, textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(l => (
                  <li key={l} style={{ marginBottom: 10 }}>
                    <a href="#" style={{
                      fontSize: 14, color: 'rgba(255,255,255,0.45)',
                      fontWeight: 400, transition: 'color 0.15s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: 28, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.25)',
          }}>
            © {new Date().getFullYear()} GearScanner. All rights reserved.
          </div>
          <div style={{
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#1A8A4A',
              boxShadow: '0 0 6px rgba(26,138,74,0.7)',
            }} />
            <span style={{
              fontSize: 12, color: 'rgba(255,255,255,0.3)',
            }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
          footer .container > div:first-child > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
