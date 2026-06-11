import React, { useEffect, useState } from 'react';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="home" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        filter: 'brightness(0.35)',
      }} />

      {/* Grid texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,134,222,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,134,222,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        opacity: 0.6,
      }} />

      {/* Animated gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,22,40,0.9) 0%, rgba(10,32,64,0.7) 50%, rgba(196,30,58,0.12) 100%)',
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '20%', right: '15%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(46,134,222,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '5%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(196,30,58,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div className="container" style={{
        position: 'relative', zIndex: 2,
        paddingTop: 160, paddingBottom: 100,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(46,134,222,0.15)',
          border: '1px solid rgba(46,134,222,0.4)',
          borderRadius: 100,
          padding: '7px 16px',
          marginBottom: 28,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#2E86DE',
            boxShadow: '0 0 8px rgba(46,134,222,0.8)',
            animation: 'pulse 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 0.5,
          }}>NFPA 1850 Compliant · AI-Powered</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.07,
          letterSpacing: -1.5,
          marginBottom: 12,
          maxWidth: 760,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.08s',
        }}>
          AI-Powered Fire Gear
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #2E86DE 0%, #5BA4E8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Management
          </span>
          <br />
          Built for Fire Departments
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 'clamp(17px, 2vw, 21px)',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.6,
          maxWidth: 560,
          marginBottom: 44,
          fontWeight: 400,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.18s',
        }}>
          Scan manufacturer labels instantly with AI. Track retirements,
          manage compliance, and protect your firefighters — all in one place.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.28s',
        }}>
          <HeroBtn primary href="#contact">
            Request a Demo
          </HeroBtn>
          <HeroBtn href="https://app.gearscanner.net/demo">
            Try Live Demo
          </HeroBtn>
        </div>

        {/* Trust indicators */}
        <div style={{
          display: 'flex', gap: 24, marginTop: 52, flexWrap: 'wrap',
          opacity: loaded ? 1 : 0,
          transition: 'all 0.7s ease 0.38s',
        }}>
          {[
            { icon: '🔒', text: 'SOC 2 Compliant' },
            { icon: '⚡', text: 'Instant AI Scanning' },
            { icon: '☁️', text: 'Cloud-Synced' },
            { icon: '🚒', text: 'Built for Fire Departments' },
          ].map(item => (
            <div key={item.text} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 500,
            }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: 0.5, zIndex: 2,
      }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: 1, height: 40,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
        }} />
      </div>
    </section>
  );
}

function HeroBtn({ children, href, primary }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '15px 28px',
        fontSize: 16, fontWeight: 700,
        borderRadius: 10,
        letterSpacing: 0.2,
        transition: 'all 0.2s',
        ...(primary ? {
          background: hover ? '#1a6db5' : '#2E86DE',
          color: '#fff',
          boxShadow: hover ? '0 8px 28px rgba(46,134,222,0.5)' : '0 4px 16px rgba(46,134,222,0.35)',
          transform: hover ? 'translateY(-2px)' : 'none',
        } : {
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          transform: hover ? 'translateY(-2px)' : 'none',
          boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
        }),
      }}
    >
      {children}
    </a>
  );
}
