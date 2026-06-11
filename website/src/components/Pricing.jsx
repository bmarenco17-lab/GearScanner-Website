import React, { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: '$499',
    period: 'per month',
    desc: 'Built for single-station departments ready to modernize gear compliance.',
    features: [
      '1 station',
      'Up to 50 firefighters',
      'AI label scanning',
      'Retirement tracking',
      'Excel export',
      'Email support',
    ],
    cta: 'Request a Demo',
    ctaHref: '#contact',
    highlight: false,
    color: '#2E86DE',
  },
  {
    name: 'Professional',
    price: '$899',
    period: 'per month',
    desc: 'For growing departments managing multiple stations and larger crews.',
    features: [
      'Up to 3 stations',
      'Up to 150 firefighters',
      'Everything in Starter',
      'Advanced dashboard',
      '5-year budget planner',
      'Priority support',
    ],
    cta: 'Request a Demo',
    ctaHref: '#contact',
    highlight: true,
    badge: 'Most Popular',
    color: '#2E86DE',
  },
  {
    name: 'Enterprise',
    price: '$1,499',
    period: 'per month',
    desc: 'County-wide and multi-department deployments with white-glove support.',
    features: [
      'Unlimited stations',
      'Unlimited firefighters',
      'Everything in Professional',
      'Dedicated account manager',
      'Custom onboarding',
      'Phone support',
    ],
    cta: 'Contact Us',
    ctaHref: '#contact',
    highlight: false,
    color: '#7C3AED',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{
      padding: '96px 0',
      background: '#fff',
    }}>
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
            Pricing
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900, color: '#0A1628',
            letterSpacing: -1, lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{
            fontSize: 18, color: '#64748B',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.6,
          }}>
            Purpose-built pricing for fire departments of every size.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}>
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          textAlign: 'center', marginTop: 40,
          fontSize: 14, color: '#94A3B8',
        }}>
          No contracts. Cancel anytime.
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #pricing .container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
            max-width: 480px;
            margin: 0 auto;
          }
        }
        @media (max-width: 640px) {
          #pricing { padding: 64px 0 !important; }
          #pricing .container > div:nth-child(2) > div {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function PricingCard({ plan }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: plan.highlight
          ? '2px solid #2E86DE'
          : `1px solid ${hover ? '#CBD5E0' : '#E2E8F0'}`,
        borderRadius: 20,
        padding: plan.highlight ? '36px 32px' : '32px 28px',
        background: plan.highlight ? '#0A1628' : '#fff',
        position: 'relative',
        transform: plan.highlight ? 'scale(1.04)' : hover ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s ease',
        boxShadow: plan.highlight
          ? '0 20px 60px rgba(46,134,222,0.25)'
          : hover ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -14, left: '50%',
          transform: 'translateX(-50%)',
          background: '#2E86DE',
          color: '#fff',
          fontSize: 11, fontWeight: 800,
          letterSpacing: 1.5, textTransform: 'uppercase',
          padding: '5px 16px', borderRadius: 100,
          whiteSpace: 'nowrap',
        }}>
          {plan.badge}
        </div>
      )}

      <div style={{
        fontSize: 13, fontWeight: 700,
        color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#64748B',
        textTransform: 'uppercase', letterSpacing: 1.5,
        marginBottom: 12,
      }}>
        {plan.name}
      </div>

      <div style={{ marginBottom: 4 }}>
        <span style={{
          fontSize: 42,
          fontWeight: 900,
          color: plan.highlight ? '#fff' : '#0A1628',
          letterSpacing: -2,
          lineHeight: 1,
        }}>
          {plan.price}
        </span>
        {plan.price !== 'Custom' && (
          <span style={{
            fontSize: 15, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94A3B8',
            fontWeight: 500, marginLeft: 4,
          }}>/mo</span>
        )}
      </div>
      <div style={{
        fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.4)' : '#94A3B8',
        marginBottom: 16,
      }}>
        {plan.period}
      </div>

      <p style={{
        fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.65)' : '#64748B',
        lineHeight: 1.6, marginBottom: 24,
      }}>
        {plan.desc}
      </p>

      {/* Divider */}
      <div style={{
        height: 1,
        background: plan.highlight ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
        marginBottom: 24,
      }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', marginBottom: 28 }}>
        {plan.features.map(f => (
          <li key={f} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#475569',
            marginBottom: 10, lineHeight: 1.5,
          }}>
            <span style={{
              color: '#1A8A4A', fontWeight: 900,
              fontSize: 12, marginTop: 2, flexShrink: 0,
            }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={plan.ctaHref}
        style={{
          display: 'block', textAlign: 'center',
          padding: '13px 20px',
          fontSize: 14, fontWeight: 700,
          borderRadius: 10,
          transition: 'all 0.2s',
          ...(plan.highlight ? {
            background: '#2E86DE',
            color: '#fff',
          } : {
            background: 'transparent',
            color: '#0A1628',
            border: '1.5px solid #CBD5E0',
          }),
        }}
        onMouseEnter={e => {
          if (plan.highlight) {
            e.currentTarget.style.background = '#1a6db5';
          } else {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#94A3B8';
          }
        }}
        onMouseLeave={e => {
          if (plan.highlight) {
            e.currentTarget.style.background = '#2E86DE';
          } else {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#CBD5E0';
          }
        }}
      >
        {plan.cta}
      </a>
    </div>
  );
}
