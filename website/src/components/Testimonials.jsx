import React from 'react';

const testimonials = [
  {
    quote: "GearScanner cut our annual gear audit time from three days to three hours. The AI scanning is shockingly accurate — it reads even faded labels that we'd have to squint at. Our battalion chief was skeptical until he saw it in action.",
    name: 'Captain Mike Hernandez',
    role: 'Station 12, Sacramento Fire Department',
    avatar: 'MH',
    color: '#2E86DE',
    rating: 5,
  },
  {
    quote: "We had a gear retirement we nearly missed — seven coats that were six months past the NFPA deadline. GearScanner caught it automatically and flagged them red. That alone made it worth every penny. I can't imagine doing compliance without it now.",
    name: 'Fire Marshal Sandra Kowalski',
    role: 'Director of Safety, Portland Fire & Rescue',
    avatar: 'SK',
    color: '#1A8A4A',
    rating: 5,
  },
  {
    quote: "Budget planning used to be guesswork. Now I pull the 5-year replacement report, drop it in front of the city council, and they approve it. Real data wins every argument. GearScanner paid for itself in the first budget cycle.",
    name: 'Chief David Okonkwo',
    role: 'Fire Chief, Riverside Fire Department',
    avatar: 'DO',
    color: '#D97706',
    rating: 5,
  },
];

function StarRating({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section style={{
      padding: '96px 0',
      background: '#0A1628',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,134,222,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,134,222,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(46,134,222,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700,
            color: '#2E86DE', letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'rgba(46,134,222,0.12)',
            border: '1px solid rgba(46,134,222,0.25)',
            padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
          }}>
            Testimonials
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: -1, lineHeight: 1.1,
          }}>
            What Early Users Are Saying
          </h2>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '32px 28px',
              display: 'flex', flexDirection: 'column',
              gap: 0,
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + '50'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
            >
              <StarRating count={t.rating} />

              {/* Quote mark */}
              <div style={{
                fontSize: 52, lineHeight: 0.8,
                color: t.color, opacity: 0.4,
                fontFamily: 'Georgia, serif',
                marginBottom: 12,
              }}>"</div>

              <p style={{
                fontSize: 15, color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.75, fontStyle: 'italic',
                flexGrow: 1, marginBottom: 28,
              }}>
                {t.quote}
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#fff',
                  flexShrink: 0,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    marginBottom: 2,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.4,
                  }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
