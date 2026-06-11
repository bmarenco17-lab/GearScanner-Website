import React, { useState } from 'react';

const features = [
  {
    abbr: 'AI',
    title: 'AI Label Scanning',
    desc: 'Point your camera at any manufacturer label. Claude AI reads it instantly — no typing required.',
  },
  {
    abbr: 'DB',
    title: 'Smart Dashboard',
    desc: 'See your entire fleet health at a glance. Color-coded alerts for expired and expiring gear.',
  },
  {
    abbr: 'RT',
    title: 'Retirement Tracking',
    desc: 'Automatic 10-year NFPA retirement countdowns. Never miss a retirement deadline again.',
  },
  {
    abbr: 'DD',
    title: 'Duplicate Detection',
    desc: 'Serial number and assignment duplicate alerts. Know exactly who has what gear at all times.',
  },
  {
    abbr: '5Y',
    title: '5-Year Budget Planner',
    desc: 'Automatic replacement cost projections. Give your chief the budget data they need.',
  },
  {
    abbr: 'XL',
    title: 'Excel Export',
    desc: 'Export your entire inventory to Excel anytime. Perfect for inspections and audits.',
  },
];

function FeatureCard({ feature }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#fff' : '#F8FAFC',
        border: `1px solid ${hover ? 'rgba(46,134,222,0.3)' : '#E2E8F0'}`,
        borderRadius: 16,
        padding: '32px 28px',
        transition: 'all 0.25s ease',
        transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? '0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(46,134,222,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48,
        borderRadius: '50%',
        background: '#0A1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        flexShrink: 0,
        transition: 'transform 0.25s',
        transform: hover ? 'scale(1.08)' : 'none',
      }}>
        <span style={{
          fontSize: 13, fontWeight: 900,
          color: '#fff', letterSpacing: 0.5,
          fontFamily: 'Inter, sans-serif',
        }}>
          {feature.abbr}
        </span>
      </div>

      <h3 style={{
        fontSize: 18, fontWeight: 800,
        color: '#0A1628',
        marginBottom: 10,
        letterSpacing: -0.3,
      }}>
        {feature.title}
      </h3>
      <p style={{
        fontSize: 15, color: '#475569',
        lineHeight: 1.65, fontWeight: 400,
      }}>
        {feature.desc}
      </p>

      {/* Bottom accent */}
      <div style={{
        marginTop: 20,
        height: 3, borderRadius: 2,
        background: hover ? '#2E86DE' : 'transparent',
        transition: 'background 0.3s',
        width: '40%',
      }} />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" style={{ padding: '96px 0', background: '#fff' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700,
            color: '#2E86DE', letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'rgba(46,134,222,0.08)',
            padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
          }}>
            Features
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900, color: '#0A1628',
            letterSpacing: -1, lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Everything Your Department Needs
          </h2>
          <p style={{
            fontSize: 18, color: '#64748B',
            maxWidth: 520, margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Purpose-built tools for fire departments to manage gear compliance,
            track retirements, and protect every firefighter on duty.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {features.map(f => <FeatureCard key={f.title} feature={f} />)}
        </div>

        {/* Checklist callout */}
        <div className="features-callout" style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(46,134,222,0.06)',
          border: '1px solid rgba(46,134,222,0.18)',
          borderRadius: 14,
          padding: '20px 28px',
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>✅</span>
          <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.6 }}>
            <strong style={{ color: '#0A1628' }}>Free NFPA 1850 gear inventory &amp; compliance checklist</strong> —
            available right inside the GearScanner app, no extra setup required.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #features .container > div:nth-child(2) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          #features { padding: 64px 0 !important; }
          #features .container > div:first-child {
            margin-bottom: 40px !important;
          }
        }
        @media (max-width: 560px) {
          #features .container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          #features .features-callout {
            flex-direction: column !important;
            align-items: flex-start !important;
            text-align: left;
          }
        }
      `}</style>
    </section>
  );
}
