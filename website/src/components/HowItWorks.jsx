import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Enter Employee ID',
    desc: 'Firefighter scans their badge or types their ID into GearScanner on any mobile device or tablet.',
  },
  {
    num: '02',
    title: 'Scan the Label',
    desc: 'AI reads the manufacturer label automatically — serial number, manufacture date, model, and more extracted in seconds.',
  },
  {
    num: '03',
    title: 'Data Saved Instantly',
    desc: 'Records saved to the cloud, accessible from anywhere. Retirement countdowns start automatically.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding: '96px 0',
      background: '#F8FAFC',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,134,222,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700,
            color: '#2E86DE', letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'rgba(46,134,222,0.08)',
            padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
          }}>
            How It Works
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900, color: '#0A1628',
            letterSpacing: -1, lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Up and Running in Minutes
          </h2>
          <p style={{
            fontSize: 18, color: '#64748B',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.6,
          }}>
            No complex setup. No training required. Your crew can start scanning gear on day one.
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          position: 'relative',
        }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute',
            top: 32, left: '18%', right: '18%',
            height: 2,
            background: 'linear-gradient(90deg, #0A1628, #2E86DE, #0A1628)',
            opacity: 0.25,
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {steps.map((step, i) => (
            <div key={step.num} style={{ position: 'relative', zIndex: 1 }}>
              {/* Number circle */}
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: '#0A1628',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(10,22,40,0.2)',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 20, fontWeight: 900,
                  color: '#fff', letterSpacing: -0.5,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {step.num}
                </span>
              </div>

              {/* Step label */}
              <div style={{
                fontSize: 12, fontWeight: 800,
                color: '#2E86DE',
                letterSpacing: 2, textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Step {step.num}
              </div>

              <h3 style={{
                fontSize: 22, fontWeight: 800,
                color: '#0A1628',
                marginBottom: 12, letterSpacing: -0.3,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 15, color: '#475569',
                lineHeight: 1.7,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #how-it-works .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
          #how-it-works .connector-line { display: none; }
        }
      `}</style>
    </section>
  );
}
