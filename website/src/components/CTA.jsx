import React, { useState } from 'react';

export default function CTA() {
  const [hover1, setHover1] = useState(false);

  return (
    <section id="cta" style={{
      padding: '96px 0',
      background: 'linear-gradient(135deg, #0A1628 0%, #0D2040 50%, #0A1628 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glows */}
      <div style={{
        position: 'absolute', top: -100, left: -100,
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(46,134,222,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: -100,
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(196,30,58,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,134,222,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,134,222,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 900, color: '#fff',
          letterSpacing: -1.5, lineHeight: 1.1,
          marginBottom: 20,
          maxWidth: 680, margin: '0 auto 20px',
        }}>
          See GearScanner
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #2E86DE, #5BA4E8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            in Action
          </span>
        </h2>

        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.65)',
          maxWidth: 480, margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          Schedule a personalized demo for your department.
          We'll walk you through every feature and answer your questions live.
        </p>

        {/* Button */}
        <div style={{
          display: 'flex', gap: 14, justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 40,
        }}>
          <a
            href="#contact"
            onMouseEnter={() => setHover1(true)}
            onMouseLeave={() => setHover1(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px',
              fontSize: 17, fontWeight: 700,
              background: hover1 ? '#1a6db5' : '#2E86DE',
              color: '#fff',
              borderRadius: 10,
              transition: 'all 0.2s',
              transform: hover1 ? 'translateY(-2px)' : 'none',
              boxShadow: hover1 ? '0 12px 32px rgba(46,134,222,0.5)' : '0 4px 16px rgba(46,134,222,0.3)',
            }}
          >
            Request a Demo
          </a>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 32, justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            '✓ No contracts',
            '✓ Cancel anytime',
            '✓ Personalized walkthrough',
          ].map(t => (
            <span key={t} style={{
              fontSize: 14, color: 'rgba(255,255,255,0.45)',
              fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          #cta { padding: 64px 0 !important; }
        }
      `}</style>
    </section>
  );
}
