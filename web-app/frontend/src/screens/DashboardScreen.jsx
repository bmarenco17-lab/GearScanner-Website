import React, { useMemo, useState } from 'react';
import {
  retirementDays, retirementStatusKey,
  calcRetirementDate, fmtDate, RET_STATUS,
} from '../utils/retirement.js';

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(ts) {
  const m = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

const AVATAR_COLORS = [
  '#2563EB', '#1A8A4A', '#7C3AED', '#B45309', '#C41E3A',
  '#0D9488', '#D97706', '#EA580C', '#1E40AF', '#065F46',
];
function avatarColor(name) {
  let h = 0;
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// 3-status color palette
const STATUS_COLORS = {
  green:   '#1A8A4A',
  yellow:  '#D97706',
  red:     '#C41E3A',
  unknown: '#CBD5E0',
};

// ── Sub-components ────────────────────────────────────────────

function StatCard({ value, label, accent, icon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '18px 14px 14px',
      border: '1px solid #E2E8F0',
      borderTop: `4px solid ${accent}`,
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontSize: 18, marginBottom: 2 }}>{icon}</span>
      <span style={{ fontSize: 40, fontWeight: 900, color: '#0A1628', lineHeight: 1, letterSpacing: -1 }}>
        {value}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 800, color: '#718096',
        textTransform: 'uppercase', letterSpacing: 1.2,
        textAlign: 'center', marginTop: 4,
      }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 800, color: '#0A1628',
          textTransform: 'uppercase', letterSpacing: 1.2,
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#9BA5B4', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}

function Card({ children, accent, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '20px 18px 16px',
      border: '1px solid #E2E8F0',
      borderLeft: `4px solid ${accent || '#2E86DE'}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function DashboardScreen({ records, onNavigateScan }) {
  // ── Pre-compute retirement status for every record ─────────
  const enriched = useMemo(() => records.map(r => {
    const days = retirementDays(r.manufactureDate);
    return { ...r, retDays: days, retKey: retirementStatusKey(days) };
  }), [records]);

  // Only 3 active statuses + unknown
  const counts = useMemo(() => {
    const c = { green: 0, yellow: 0, red: 0, unknown: 0 };
    enriched.forEach(r => { c[r.retKey] = (c[r.retKey] || 0) + 1; });
    return c;
  }, [enriched]);

  const total = records.length;

  // ── Unique firefighter count ───────────────────────────────
  const ffCount = useMemo(() =>
    new Set(records.map(r => r.employeeId).filter(Boolean)).size,
    [records]
  );

  // ── Retirement alerts: red + yellow only ──────────────────
  const retirementAlerts = useMemo(() =>
    enriched
      .filter(r => r.retKey === 'red' || r.retKey === 'yellow')
      .sort((a, b) => (a.retDays ?? 9999) - (b.retDays ?? 9999)),
    [enriched]
  );

  // ── Station summary ────────────────────────────────────────
  const stationStats = useMemo(() => {
    const map = {};
    enriched.forEach(r => {
      const st = r.station || 'Unknown';
      if (!map[st]) map[st] = { ff: new Set(), gear: 0, green: 0, yellow: 0, red: 0, unknown: 0 };
      map[st].ff.add(r.employeeId);
      map[st].gear++;
      map[st][r.retKey] = (map[st][r.retKey] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ff: d.ff.size, ...d }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enriched]);

  // ── Recent activity (last 8) ───────────────────────────────
  const recent = useMemo(() =>
    [...records]
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 8),
    [records]
  );

  // ── Status bar segments ────────────────────────────────────
  const barSegs = useMemo(() => {
    const t = total || 1;
    return ['green', 'yellow', 'red'].map(k => ({
      k, pct: ((counts[k] || 0) / t) * 100, count: counts[k] || 0,
    })).filter(s => s.count > 0);
  }, [counts, total]);

  // ── Empty state ────────────────────────────────────────────
  if (total === 0) {
    return (
      <div>
        <DashHeader />
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0A1628', marginBottom: 8 }}>
            No gear scanned yet
          </div>
          <div style={{ fontSize: 15, color: '#4A5568', marginBottom: 28, lineHeight: 1.6 }}>
            Start scanning gear to see your department's health dashboard.
          </div>
          <button
            onClick={onNavigateScan}
            style={{
              background: '#2E86DE', color: '#fff', border: 'none',
              borderRadius: 8, padding: '16px 36px', fontSize: 16,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(46,134,222,0.35)',
            }}
          >
            📷 Scan First Piece of Gear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100%' }}>
      <DashHeader />

      <div style={{ padding: '12px 14px 28px' }}>

        {/* ── 1. KPI cards: Total / Active / Expiring Soon / Expired ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <StatCard value={total}            label="Total Gear Items"  accent="#1E3A5F" icon="🧰" />
          <StatCard value={counts.green  || 0} label="Active"          accent="#1A8A4A" icon="✅" />
          <StatCard value={counts.yellow || 0} label="Expiring Soon"   accent="#D97706" icon="⚠️" />
          <StatCard value={counts.red    || 0} label="Expired"         accent="#C41E3A" icon="🚨" />
        </div>

        {/* ── 2. Fleet status bar ── */}
        <Card accent="#2E86DE">
          <SectionHeader
            title="Fleet Gear Status"
            subtitle={`${counts.green || 0} active · ${counts.yellow || 0} expiring soon · ${counts.red || 0} expired`}
          />
          {/* Stacked bar */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 20, marginBottom: 12, background: '#F0F4F8' }}>
            {barSegs.map(({ k, pct }) => (
              <div
                key={k}
                style={{
                  width: `${pct}%`, background: STATUS_COLORS[k],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff',
                  overflow: 'hidden', minWidth: pct > 4 ? '10px' : 0,
                  transition: 'width 0.5s ease',
                }}
              >
                {pct >= 7 ? `${Math.round(pct)}%` : ''}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
            {[
              { k: 'green',   label: 'Active',         count: counts.green   || 0 },
              { k: 'yellow',  label: 'Expiring Soon',  count: counts.yellow  || 0 },
              { k: 'red',     label: 'Expired',        count: counts.red     || 0 },
              { k: 'unknown', label: 'No Date',        count: counts.unknown || 0 },
            ].filter(i => i.count > 0).map(({ k, label, count }) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[k], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#4A5568', fontWeight: 600 }}>
                  {label} <span style={{ fontWeight: 800, color: '#0A1628' }}>{count}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 3. Station Summary Table ── */}
        {stationStats.length > 0 && (
          <Card accent="#1E3A5F">
            <SectionHeader title="Station Summary" />
            <div style={{ overflowX: 'auto', margin: '0 -2px' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Station</th>
                    <th className="dash-th" style={{ textAlign: 'center' }}>👥 FF</th>
                    <th className="dash-th" style={{ textAlign: 'center' }}>🧰 Gear</th>
                    <th className="dash-th" style={{ textAlign: 'center', color: STATUS_COLORS.green  }}>Active</th>
                    <th className="dash-th" style={{ textAlign: 'center', color: STATUS_COLORS.yellow }}>Expiring Soon</th>
                    <th className="dash-th" style={{ textAlign: 'center', color: STATUS_COLORS.red    }}>Expired</th>
                  </tr>
                </thead>
                <tbody>
                  {stationStats.map((s, i) => (
                    <tr key={s.name} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
                      <td className="dash-td" style={{ fontWeight: 700, color: '#0A1628' }}>{s.name}</td>
                      <td className="dash-td" style={{ textAlign: 'center' }}>{s.ff}</td>
                      <td className="dash-td" style={{ textAlign: 'center', fontWeight: 700 }}>{s.gear}</td>
                      <td className="dash-td" style={{ textAlign: 'center' }}>
                        {(s.green || 0) > 0 && <span className="dash-count" style={{ color: STATUS_COLORS.green }}>{s.green}</span>}
                      </td>
                      <td className="dash-td" style={{ textAlign: 'center' }}>
                        {(s.yellow || 0) > 0 && (
                          <span className="dash-count dash-count-alert" style={{ color: STATUS_COLORS.yellow, background: STATUS_COLORS.yellow + '18' }}>
                            {s.yellow}
                          </span>
                        )}
                      </td>
                      <td className="dash-td" style={{ textAlign: 'center' }}>
                        {(s.red || 0) > 0 && (
                          <span className="dash-count dash-count-alert" style={{ color: STATUS_COLORS.red, background: STATUS_COLORS.red + '15' }}>
                            {s.red}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: '#0A1628', borderTop: '2px solid #1E3A5F' }}>
                    <td className="dash-td" style={{ fontWeight: 800, color: '#fff', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Total</td>
                    <td className="dash-td" style={{ textAlign: 'center', fontWeight: 800, color: '#93C5FD' }}>{ffCount}</td>
                    <td className="dash-td" style={{ textAlign: 'center', fontWeight: 800, color: '#93C5FD' }}>{total}</td>
                    <td className="dash-td" style={{ textAlign: 'center', fontWeight: 800, color: '#6EE7A0' }}>{counts.green  || 0}</td>
                    <td className="dash-td" style={{ textAlign: 'center', fontWeight: 800, color: '#FDE68A' }}>{counts.yellow || 0}</td>
                    <td className="dash-td" style={{ textAlign: 'center', fontWeight: 800, color: '#FCA5A5' }}>{counts.red    || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── 4. Retirement alerts accordion ── */}
        <RetirementAccordion retirementAlerts={retirementAlerts} />

        {/* ── 5. Recent activity ── */}
        {recent.length > 0 && (
          <Card accent="#2E86DE">
            <SectionHeader
              title="Recent Activity"
              subtitle="Latest gear records added"
            />
            {recent.map((r, i) => {
              const color = avatarColor(r.name);
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < recent.length - 1 ? '1px solid #F0F4F8' : 'none',
                }}>
                  {/* Initials circle */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                    boxShadow: `0 2px 8px ${color}44`,
                  }}>
                    {initials(r.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 1 }}>
                      {r.name || r.employeeId}
                      {r.station && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700,
                          color: '#2E86DE', background: '#EBF4FF',
                          padding: '1px 7px', borderRadius: 10,
                        }}>{r.station}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#718096' }}>
                      {[r.gearType, r.manufacturer].filter(Boolean).map((v, idx) => (
                        <span key={idx}>
                          {idx > 0 && <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>}
                          <span style={{ textTransform: idx === 0 ? 'capitalize' : 'none' }}>{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: '#9BA5B4', fontWeight: 600, flexShrink: 0 }}>
                    {timeAgo(r.timestamp)}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

      </div>
    </div>
  );
}

// ── Dashboard header banner ───────────────────────────────────
function DashHeader() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 60%, #0A1628 100%)',
      padding: '18px 20px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 28px)',
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: -40, right: -20,
        width: 150, height: 150,
        background: 'radial-gradient(circle, rgba(46,134,222,0.3) 0%, transparent 70%)',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: 'rgba(46,134,222,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
          boxShadow: '0 4px 14px rgba(46,134,222,0.4)',
        }}>🛡️</div>
        <div>
          <div style={{
            fontSize: 9, fontWeight: 800, color: '#2E86DE',
            letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 3,
          }}>
            Equipment Dashboard
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>
            Gear Health Monitor
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Updated</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Retirement alerts accordion ───────────────────────────────
function RetirementAccordion({ retirementAlerts }) {
  const [open, setOpen] = useState(false);

  const redCnt    = retirementAlerts.filter(r => r.retKey === 'red').length;
  const yellowCnt = retirementAlerts.filter(r => r.retKey === 'yellow').length;
  const total     = retirementAlerts.length;
  const allClear  = total === 0;

  const accent = redCnt > 0 ? '#C41E3A' : yellowCnt > 0 ? '#D97706' : '#1A8A4A';

  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: '1px solid #E2E8F0', borderLeft: `4px solid ${accent}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      marginBottom: 14, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 800, color: '#0A1628',
          textTransform: 'uppercase', letterSpacing: 1.2, flexShrink: 0,
        }}>
          NFPA Retirement Alerts
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, flexWrap: 'wrap' }}>
          {allClear ? (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#1A8A4A',
              background: '#E6F5EC', borderRadius: 20, padding: '2px 10px',
            }}>✓ All Gear Active</span>
          ) : (
            <>
              {redCnt    > 0 && <span className="ret-pill ret-pill-red">🔴 {redCnt} Expired</span>}
              {yellowCnt > 0 && <span className="ret-pill ret-pill-yellow">🟡 {yellowCnt} Expiring Soon</span>}
            </>
          )}
        </div>

        <span style={{
          fontSize: 11, color: '#9BA5B4', flexShrink: 0,
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s',
        }}>▼</span>
      </button>

      <div style={{
        maxHeight: open ? `${total * 100 + 80}px` : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid #F0F4F8' }}>
          {allClear ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#1A8A4A', fontWeight: 600 }}>
              ✓ No gear is approaching retirement
            </div>
          ) : (
            <>
              <p style={{ fontSize: 11, color: '#9BA5B4', margin: '12px 0 8px', fontWeight: 500 }}>
                NFPA 1971 requires retirement 10 years from manufacture date.
              </p>
              {retirementAlerts.map((r, i) => {
                const s       = RET_STATUS[r.retKey];
                const retDate = calcRetirementDate(r.manufactureDate);
                const over    = r.retDays !== null && r.retDays < 0;
                const absDays = r.retDays !== null ? Math.abs(r.retDays) : null;
                return (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: i % 2 === 0 ? '#F8FAFC' : '#fff',
                    marginBottom: 4,
                    borderLeft: `3px solid ${s.badge}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                          background: s.badge, color: '#fff',
                          borderRadius: 4, padding: '3px 8px',
                          fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                          animation: over ? 'pulseBadge 1.5s ease-in-out infinite' : 'none',
                        }}>
                          {over ? '🚨 MUST RETIRE' : `${absDays}d Left`}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>
                          {r.name || r.employeeId}
                        </span>
                        {r.station && (
                          <span style={{
                            fontSize: 10, color: '#2E86DE', background: '#EBF4FF',
                            padding: '1px 7px', borderRadius: 10, fontWeight: 700,
                          }}>{r.station}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#4A5568' }}>
                        {[r.gearType, r.manufacturer].filter(Boolean).join(' · ') || 'Unknown gear'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9BA5B4', marginTop: 3, display: 'flex', gap: 12 }}>
                        <span>Mfg: {r.manufactureDate || '—'}</span>
                        <span>Retires: {fmtDate(retDate)}</span>
                        {over && absDays !== null && (
                          <span style={{ color: '#C41E3A', fontWeight: 700 }}>
                            {(absDays / 365).toFixed(1)} yrs overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
