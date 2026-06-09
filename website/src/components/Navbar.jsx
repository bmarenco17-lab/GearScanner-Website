import React, { useState, useEffect } from 'react';

function ShieldLogo() {
  return (
    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 1L34 7.5V20C34 29.5 26.5 37 18 39.5C9.5 37 2 29.5 2 20V7.5L18 1Z"
        fill="#2E86DE" />
      <path d="M18 5L30 10.5V20C30 27.5 24.5 34 18 36.5C11.5 34 6 27.5 6 20V10.5L18 5Z"
        fill="#0A1628" />
      <text x="18" y="25" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900"
        fontSize="11" fill="white" letterSpacing="0.5">GS</text>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(10,22,40,0.97)' : 'rgba(10,22,40,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(46,134,222,0.15)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', height: 68,
        gap: 0,
      }}>
        {/* Logo */}
        <a href="#" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0, textDecoration: 'none',
        }}>
          <ShieldLogo />
          <span style={{
            fontSize: 20, fontWeight: 900, color: '#fff',
            letterSpacing: 1.5, textTransform: 'uppercase',
          }}>
            Gear<span style={{ color: '#2E86DE' }}>Scanner</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          marginLeft: 'auto',
        }} className="desktop-nav">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14, fontWeight: 500,
              padding: '8px 14px', borderRadius: 6,
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.8)'; e.target.style.background = 'transparent'; }}>
              {l.label}
            </a>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 8px' }} />
          <a href="#" style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14, fontWeight: 600,
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 7,
            transition: 'all 0.2s',
            marginRight: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            Sign In
          </a>
          <a href="#contact" style={{
            background: '#2E86DE',
            color: '#fff',
            fontSize: 14, fontWeight: 700,
            padding: '9px 18px',
            borderRadius: 7,
            letterSpacing: 0.3,
            transition: 'background 0.2s, transform 0.15s',
            display: 'inline-block',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1a6db5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2E86DE'; e.currentTarget.style.transform = 'none'; }}>
            Request a Demo
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            marginLeft: 'auto',
            display: 'none',
            background: 'none', border: 'none',
            color: '#fff', fontSize: 22,
            padding: 8, cursor: 'pointer',
          }}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#0D2040',
          borderTop: '1px solid rgba(46,134,222,0.2)',
          padding: '16px 24px 20px',
        }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: 'rgba(255,255,255,0.85)',
                fontSize: 16, fontWeight: 500,
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexDirection: 'column' }}>
            <a href="#" style={{
              textAlign: 'center', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, padding: '12px',
              fontWeight: 600, fontSize: 15,
            }}>Sign In</a>
            <a href="#contact" onClick={() => setMenuOpen(false)} style={{
              textAlign: 'center', color: '#fff',
              background: '#2E86DE',
              borderRadius: 8, padding: '12px',
              fontWeight: 700, fontSize: 15,
            }}>Request a Demo</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
