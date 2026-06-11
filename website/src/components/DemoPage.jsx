import React, { useState, useMemo } from 'react';

// ── Color tokens (matches main site) ────────────────────────────
const NAVY  = '#0A1628';
const NAVY2 = '#1E3A5F';
const BLUE  = '#2E86DE';
const GREEN = '#1A8A4A';
const YELLOW= '#D97706';
const RED   = '#C41E3A';
const GRAY  = '#94A3B8';

const STATUS_THEME = {
  green:   { bg: '#F0FFF4', text: '#065F46', dot: GREEN,  label: 'Active' },
  yellow:  { bg: '#FFFBEB', text: '#92400E', dot: YELLOW, label: 'Expiring Soon' },
  red:     { bg: '#FFF0F3', text: '#C41E3A', dot: RED,    label: 'Expired' },
};

// ── Retirement calc (10-year NFPA rule) ──────────────────────────
const TODAY = new Date('2026-06-10');

function retirementInfo(mfgDateStr) {
  const mfg = new Date(mfgDateStr);
  const retireDate = new Date(mfg.getFullYear() + 10, mfg.getMonth(), mfg.getDate());
  const days = Math.floor((retireDate - TODAY) / 86400000);
  let status;
  if (days < 0) status = 'red';
  else if (days < 180) status = 'yellow';
  else status = 'green';
  return { retireDate, days, status };
}

// ── Sample gear data ──────────────────────────────────────────────
const RAW_GEAR = [
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Coat',   mfr: 'Globe',     serial: 'GL-88213', mfgDate: '2017-03-01' },
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Pants',  mfr: 'Globe',     serial: 'GL-88214', mfgDate: '2017-03-01' },
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Helmet', mfr: 'MSA',       serial: 'MS-30911', mfgDate: '2021-08-12' },
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Gloves', mfr: 'Shelby',     serial: 'SH-44210', mfgDate: '2023-01-15' },
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Boots',  mfr: 'Honeywell', serial: 'HW-77721', mfgDate: '2020-05-20' },
  { ff: 'Hernandez, M.', id: 'FF-1042', station: 'Station 12', type: 'Hood',   mfr: 'PGI',       serial: 'PG-19204', mfgDate: '2024-02-10' },

  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Coat',   mfr: 'Lion',      serial: 'LN-55310', mfgDate: '2019-11-05' },
  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Pants',  mfr: 'Lion',      serial: 'LN-55311', mfgDate: '2019-11-05' },
  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Helmet', mfr: 'Cairns',    serial: 'CA-22087', mfgDate: '2016-04-18' },
  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Gloves', mfr: 'Shelby',    serial: 'SH-44288', mfgDate: '2024-09-01' },
  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Boots',  mfr: 'Globe',     serial: 'GL-90021', mfgDate: '2022-06-15' },
  { ff: 'Kowalski, S.', id: 'FF-1098', station: 'Station 12', type: 'Hood',   mfr: 'PGI',       serial: 'PG-19340', mfgDate: '2018-12-01' },

  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Coat',   mfr: 'Globe',     serial: 'GL-91204', mfgDate: '2023-07-22' },
  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Pants',  mfr: 'Globe',     serial: 'GL-91205', mfgDate: '2023-07-22' },
  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Helmet', mfr: 'MSA',       serial: 'MS-31502', mfgDate: '2025-01-10' },
  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Gloves', mfr: 'Shelby',    serial: 'SH-44390', mfgDate: '2025-03-05' },
  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Boots',  mfr: 'Honeywell', serial: 'HW-78012', mfgDate: '2024-11-18' },
  { ff: 'Okonkwo, D.',  id: 'FF-1103', station: 'Station 12', type: 'Hood',   mfr: 'PGI',       serial: 'PG-19501', mfgDate: '2024-11-18' },

  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Coat',   mfr: 'Lion',      serial: 'LN-56102', mfgDate: '2015-02-14' },
  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Pants',  mfr: 'Lion',      serial: 'LN-56103', mfgDate: '2015-02-14' },
  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Helmet', mfr: 'Cairns',    serial: 'CA-22301', mfgDate: '2019-09-30' },
  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Gloves', mfr: 'Shelby',    serial: 'SH-44102', mfgDate: '2022-12-01' },
  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Boots',  mfr: 'Globe',     serial: 'GL-89213', mfgDate: '2021-04-10' },
  { ff: 'Ramirez, J.',  id: 'FF-1117', station: 'Station 12', type: 'Hood',   mfr: 'PGI',       serial: 'PG-18802', mfgDate: '2016-08-01' },

  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Coat',  mfr: 'Globe',     serial: 'GL-92110', mfgDate: '2022-01-20' },
  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Pants', mfr: 'Globe',     serial: 'GL-92111', mfgDate: '2022-01-20' },
  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Helmet', mfr: 'MSA',      serial: 'MS-30750', mfgDate: '2020-10-05' },
  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Gloves', mfr: 'Shelby',   serial: 'SH-43980', mfgDate: '2023-05-15' },
  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Boots', mfr: 'Honeywell', serial: 'HW-76502', mfgDate: '2017-07-08' },
  { ff: 'Whitfield, T.', id: 'FF-1128', station: 'Station 12', type: 'Hood',  mfr: 'PGI',       serial: 'PG-19012', mfgDate: '2021-03-22' },
];

const GEAR = RAW_GEAR.map(item => ({ ...item, ...retirementInfo(item.mfgDate) }));

const FIREFIGHTERS = [...new Set(GEAR.map(g => g.ff))];

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Page shell ────────────────────────────────────────────────────
export default function DemoPage() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <DemoHeader tab={tab} setTab={setTab} />
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {tab === 'dashboard'  && <DashboardTab />}
        {tab === 'inventory'  && <InventoryTab />}
        {tab === 'retirement' && <RetirementTab />}
      </div>
    </div>
  );
}

// ── Header / nav ──────────────────────────────────────────────────
function DemoHeader({ tab, setTab }) {
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard' },
    { id: 'inventory',  label: 'Inventory' },
    { id: 'retirement', label: 'Retirement Tracking' },
  ];

  return (
    <header style={{
      background: NAVY,
      borderBottom: `1px solid rgba(46,134,222,0.2)`,
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{
            fontSize: 18, fontWeight: 900, color: '#fff',
            letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Gear<span style={{ color: BLUE }}>Scanner</span>
          </a>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: BLUE, background: 'rgba(46,134,222,0.15)',
            border: '1px solid rgba(46,134,222,0.3)',
            borderRadius: 100, padding: '3px 10px',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Live Demo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Station 12 — Sacramento Fire Department
          </span>
          <a href="/" style={{
            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 7, padding: '7px 14px',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            ← Back to Website
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="container" style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 18px',
              fontSize: 14, fontWeight: 700,
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? `3px solid ${BLUE}` : '3px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ── Section heading helper ─────────────────────────────────────────
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: NAVY, letterSpacing: -0.5, marginBottom: 4 }}>
        {title}
      </h1>
      {sub && <p style={{ fontSize: 14, color: '#64748B' }}>{sub}</p>}
    </div>
  );
}

// ── Dashboard tab ───────────────────────────────────────────────────
function DashboardTab() {
  const total   = GEAR.length;
  const active  = GEAR.filter(g => g.status === 'green').length;
  const expSoon = GEAR.filter(g => g.status === 'yellow').length;
  const expired = GEAR.filter(g => g.status === 'red').length;

  const kpis = [
    { label: 'Total Gear',     value: total,   color: NAVY },
    { label: 'Active',         value: active,  color: GREEN },
    { label: 'Expiring Soon',  value: expSoon, color: YELLOW },
    { label: 'Expired',        value: expired, color: RED },
  ];

  const pct = (n) => Math.round((n / total) * 100);

  return (
    <div>
      <SectionTitle
        title="Fleet Overview"
        sub={`${FIREFIGHTERS.length} firefighters · ${total} pieces of gear tracked`}
      />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
            padding: '20px 22px',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: k.color, letterSpacing: -1, marginBottom: 4 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Fleet health bar */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 16 }}>Fleet Health</div>
        <div style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: `${pct(active)}%`, background: GREEN }} />
          <div style={{ width: `${pct(expSoon)}%`, background: YELLOW }} />
          <div style={{ width: `${pct(expired)}%`, background: RED }} />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Legend color={GREEN}  label={`Active (${pct(active)}%)`} />
          <Legend color={YELLOW} label={`Expiring Soon (${pct(expSoon)}%)`} />
          <Legend color={RED}    label={`Expired (${pct(expired)}%)`} />
        </div>
      </div>

      {/* Roster */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', fontSize: 15, fontWeight: 800, color: NAVY }}>
          Firefighter Roster
        </div>
        <div>
          {FIREFIGHTERS.map((ff, i) => {
            const items = GEAR.filter(g => g.ff === ff);
            const worst = items.some(g => g.status === 'red') ? 'red'
              : items.some(g => g.status === 'yellow') ? 'yellow' : 'green';
            const theme = STATUS_THEME[worst];
            return (
              <div key={ff} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px',
                borderBottom: i < FIREFIGHTERS.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{ff}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{items[0].id} · {items.length} items</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: theme.text, background: theme.bg,
                  borderRadius: 100, padding: '4px 12px',
                }}>
                  {theme.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Inventory tab ───────────────────────────────────────────────────
function InventoryTab() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const types = [...new Set(GEAR.map(g => g.type))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GEAR.filter(g => {
      if (typeFilter && g.type !== typeFilter) return false;
      if (!q) return true;
      return g.ff.toLowerCase().includes(q) ||
        g.serial.toLowerCase().includes(q) ||
        g.mfr.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q);
    });
  }, [search, typeFilter]);

  return (
    <div>
      <SectionTitle title="Gear Inventory" sub={`${GEAR.length} total records`} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, serial, manufacturer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 260px',
            padding: '11px 14px', fontSize: 14,
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            outline: 'none', fontFamily: 'Inter, sans-serif',
          }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: '11px 14px', fontSize: 14,
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            outline: 'none', fontFamily: 'Inter, sans-serif',
            color: typeFilter ? NAVY : '#94A3B8', cursor: 'pointer',
          }}
        >
          <option value="">All Gear Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Firefighter', 'Gear Type', 'Manufacturer', 'Serial #', 'Mfg Date', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: 11, fontWeight: 800, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => {
              const theme = STATUS_THEME[g.status];
              return (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: NAVY }}>{g.ff}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{g.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{g.mfr}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#475569' }}>{g.serial}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{g.mfgDate.slice(0,7)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: theme.text, background: theme.bg,
                      borderRadius: 100, padding: '4px 12px',
                      display: 'inline-block',
                    }}>
                      {theme.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                  No gear matches your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Retirement Tracking tab ─────────────────────────────────────────
function RetirementTab() {
  const expired = GEAR.filter(g => g.status === 'red').sort((a,b) => a.days - b.days);
  const expiringSoon = GEAR.filter(g => g.status === 'yellow').sort((a,b) => a.days - b.days);

  return (
    <div>
      <SectionTitle
        title="Retirement Tracking"
        sub="NFPA 1850 — gear must be retired 10 years from manufacture date"
      />

      <RetirementGroup
        title="Expired"
        items={expired}
        theme={STATUS_THEME.red}
        emptyText="No expired gear. Nice work staying ahead of compliance."
      />

      <div style={{ height: 28 }} />

      <RetirementGroup
        title="Expiring Within 180 Days"
        items={expiringSoon}
        theme={STATUS_THEME.yellow}
        emptyText="Nothing expiring in the next 180 days."
      />
    </div>
  );
}

function RetirementGroup({ title, items, theme, emptyText }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: theme.dot }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{title}</span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, color: theme.text,
          background: theme.bg, borderRadius: 100, padding: '4px 12px',
        }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '28px 24px', fontSize: 14, color: '#94A3B8' }}>{emptyText}</div>
      ) : (
        <div>
          {items.map((g, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px',
              borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none',
              flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                  {g.ff} — {g.type}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  {g.mfr} · {g.serial} · Mfg {g.mfgDate.slice(0,7)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                  {g.days < 0 ? `Expired ${Math.abs(g.days)} days ago` : `${g.days} days remaining`}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  Retirement date: {fmtDate(g.retireDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
