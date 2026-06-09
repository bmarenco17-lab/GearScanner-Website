import React, { useState, useMemo, useEffect } from 'react';
import {
  retirementDays, retirementStatusKey, retirementStatusLabel,
  calcRetirementDate, fmtDate, RET_STATUS,
} from '../utils/retirement.js';

// Gear type display helpers ────────────────────────────────────
// Use ⛑️ for helmet (accurate safety/rescue helmet).
// Use clean navy text pill for all other types — more professional
// than using wrong emojis.
const GEAR_EMOJI = { helmet: '⛑️', coat: '🧥' };

function GearBadge({ type, size = 'sm' }) {
  const key = (type || '').toLowerCase();
  const emoji = GEAR_EMOJI[key];
  if (emoji) {
    return (
      <span style={{ fontSize: size === 'lg' ? 28 : 16, lineHeight: 1 }}>{emoji}</span>
    );
  }
  const label = (type || 'GEAR').toUpperCase();
  const styles = size === 'lg'
    ? { fontSize: 11, padding: '4px 10px', borderRadius: 6, letterSpacing: 1.2 }
    : { fontSize: 8,  padding: '2px 6px',  borderRadius: 4, letterSpacing: 0.8 };
  return (
    <span style={{
      background: '#0A1628', color: '#fff',
      fontWeight: 800, display: 'inline-block',
      ...styles,
    }}>
      {label}
    </span>
  );
}

// ── Constants ─────────────────────────────────────────────────
const PER_PAGE   = 20;
const GEAR_COLS  = ['coat', 'pants', 'helmet', 'gloves', 'boots', 'hood'];

// Priority order for "worst status" (lower = worse)
// 3 statuses: red (expired) → yellow (expiring soon) → green (active)
const STATUS_PRI = { red: 0, yellow: 1, green: 2, unknown: 3 };

const STATUS_DOT = {
  green:   { color: '#1A8A4A', label: 'All Active'    },
  yellow:  { color: '#D97706', label: 'Expiring Soon' },
  red:     { color: '#C41E3A', label: 'Expired'       },
  unknown: { color: '#CBD5E0', label: '—'             },
};

// Color theme per retirement status for gear cells
const CELL_THEME = {
  red:     { bg: '#FFF0F3', text: '#C41E3A', border: 'rgba(196,30,58,0.25)', accent: '#C41E3A' },
  yellow:  { bg: '#FFFBEB', text: '#92400E', border: 'rgba(217,119,6,0.25)', accent: '#D97706' },
  green:   { bg: '#F0FFF4', text: '#065F46', border: 'rgba(26,138,74,0.2)',  accent: '#1A8A4A' },
  unknown: { bg: '#F8FAFC', text: '#9BA5B4', border: 'transparent',          accent: '#CBD5E0' },
};

// ── Group records by firefighter ──────────────────────────────
function groupByFF(records) {
  const map = {};
  records.forEach(r => {
    const key = r.employeeId || '_unknown';
    if (!map[key]) {
      map[key] = {
        key,
        employeeId: r.employeeId || '—',
        name:       r.name       || '—',
        station:    r.station    || '—',
        gear: {},     // most-recent record per gear type
        allGear: [],  // every record for this FF
      };
    }
    const gt = (r.gearType || 'other').toLowerCase();
    const existing = map[key].gear[gt];
    // Keep the record with the WORST retirement status; break ties by most recent
    if (!existing) {
      map[key].gear[gt] = r;
    } else {
      const newKey = retirementStatusKey(retirementDays(r.manufactureDate));
      const oldKey = retirementStatusKey(retirementDays(existing.manufactureDate));
      if (STATUS_PRI[newKey] < STATUS_PRI[oldKey]) {
        map[key].gear[gt] = r;       // new is worse → show it
      } else if (STATUS_PRI[newKey] === STATUS_PRI[oldKey]) {
        if ((r.timestamp || '') > (existing.timestamp || '')) map[key].gear[gt] = r;
      }
    }
    map[key].allGear.push(r);
  });
  return Object.values(map);
}

function worstStatusKey(gearMap) {
  let best = 'unknown';
  for (const r of Object.values(gearMap)) {
    const k = retirementStatusKey(retirementDays(r.manufactureDate));
    if (STATUS_PRI[k] < STATUS_PRI[best]) best = k;
  }
  return best;
}

// ── Sort arrow ────────────────────────────────────────────────
function SortArrow({ col, sortCol, sortDir }) {
  if (col !== sortCol) return <span className="sort-arrow sort-neutral">↕</span>;
  return <span className="sort-arrow sort-active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Main component ────────────────────────────────────────────
export default function RecordsScreen({ records, deleteRecord }) {
  const [search,      setSearch]      = useState('');
  const [stationFilt, setStationFilt] = useState('');
  const [sortCol,     setSortCol]     = useState('worstStatus');
  const [sortDir,     setSortDir]     = useState('asc');
  const [page,        setPage]        = useState(1);
  const [expandedKey,   setExpandedKey]   = useState(null);
  const [cardDismissed, setCardDismissed] = useState(false);

  // Reset card when search changes
  useEffect(() => { setCardDismissed(false); }, [search]);

  // ── Group + filter options ─────────────────────────────────
  const allFF = useMemo(() => groupByFF(records), [records]);

  const stations = useMemo(() => {
    const s = new Set(allFF.map(f => f.station).filter(v => v && v !== '—'));
    return [...s].sort();
  }, [allFF]);

  // ── Filter + match map ─────────────────────────────────────
  // matchMap[ff.key]:
  //   undefined → row excluded
  //   null      → FF-level match (name/ID/station); show full row, no cell effects
  //   Set       → gear-level match only; highlight matching cells, fade others
  const { filtered, matchMap } = useMemo(() => {
    const q  = search.toLowerCase().trim();
    const mm = {};

    const list = allFF.filter(f => {
      if (stationFilt && f.station !== stationFilt) return false;
      if (!q) { mm[f.key] = null; return true; }

      // FF-level: name, ID, station → full row, no highlighting
      const ffMatch =
        f.name.toLowerCase().includes(q) ||
        f.employeeId.toLowerCase().includes(q) ||
        f.station.toLowerCase().includes(q);
      if (ffMatch) { mm[f.key] = null; return true; }

      // Gear-level: serial, manufacturer, gearType → highlight matching cells
      const matched = new Set();
      Object.entries(f.gear).forEach(([gType, r]) => {
        if (
          (r.serialNumber || '').toLowerCase().includes(q) ||
          (r.manufacturer || '').toLowerCase().includes(q) ||
          (r.gearType     || '').toLowerCase().includes(q)
        ) matched.add(gType);
      });
      if (matched.size > 0) { mm[f.key] = matched; return true; }
      return false;
    });

    return { filtered: list, matchMap: mm };
  }, [allFF, search, stationFilt]);

  // ── Floating card: all gear records matching a gear-level search ──
  const matchedRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    // Only show for gear-level searches (no FF name/ID/station match)
    const isFFLevel = allFF.some(f =>
      f.name.toLowerCase().includes(q) ||
      f.employeeId.toLowerCase().includes(q) ||
      f.station.toLowerCase().includes(q)
    );
    if (isFFLevel) return [];
    return records.filter(r =>
      (r.serialNumber || '').toLowerCase().includes(q) ||
      (r.manufacturer || '').toLowerCase().includes(q) ||
      (r.gearType     || '').toLowerCase().includes(q)
    );
  }, [search, allFF, records]);

  const showMatchCard = matchedRecords.length > 0 && !cardDismissed;

  // ── Sort ───────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortCol === 'worstStatus') {
        av = STATUS_PRI[worstStatusKey(a.gear)];
        bv = STATUS_PRI[worstStatusKey(b.gear)];
      } else if (sortCol === 'totalItems') {
        av = a.allGear.length;
        bv = b.allGear.length;
      } else {
        av = (a[sortCol] || '').toLowerCase();
        bv = (b[sortCol] || '').toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 :  1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const hasFilters = search || stationFilt;

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'worstStatus' ? 'asc' : 'asc'); }
    setPage(1);
  }

  // ── Table header cell ──────────────────────────────────────
  function Th({ col, label, style = {}, className = '' }) {
    return (
      <th
        onClick={col ? () => toggleSort(col) : undefined}
        className={`rt-th ${col ? 'rt-th-sort' : ''} ${className}`}
        style={style}
      >
        {label}
        {col && <SortArrow col={col} sortCol={sortCol} sortDir={sortDir} />}
      </th>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (records.length === 0) {
    return (
      <div className="screen">
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-icon">📋</div>
          <h3>No records yet</h3>
          <p>Saved gear scans will appear here. Use the Scan tab to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="records-page">
      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="filter-row-top">
          <input
            type="search"
            placeholder="🔍  Search by name, ID, serial #, manufacturer…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="filter-search"
          />
          {hasFilters && (
            <button onClick={() => { setSearch(''); setStationFilt(''); setPage(1); }} className="btn-clear-filters">
              ✕ Clear
            </button>
          )}
        </div>
        <div className="filter-row-dropdowns">
          <select value={stationFilt} onChange={e => { setStationFilt(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Stations</option>
            {stations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-count">
          Showing <strong>{sorted.length}</strong> of <strong>{allFF.length}</strong> firefighters
          {hasFilters && <span style={{ color: '#2E86DE' }}> (filtered)</span>}
          <span style={{ margin: '0 6px', color: '#CBD5E0' }}>·</span>
          <span>{records.length} total gear records</span>
        </div>
      </div>

      {/* ── Floating gear match card(s) ── */}
      {showMatchCard && (
        <div style={{ padding: '10px 0 0' }}>
          {matchedRecords.slice(0, 3).map(r => (
            <GearMatchCard key={r.id} record={r} onClose={() => setCardDismissed(true)} />
          ))}
          {matchedRecords.length > 3 && (
            <div style={{
              fontSize: 12, color: '#9BA5B4', fontWeight: 600,
              textAlign: 'center', padding: '6px 0 10px',
            }}>
              + {matchedRecords.length - 3} more matches highlighted in the table below
            </div>
          )}
        </div>
      )}

      {/* ── No results ── */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matches</h3>
          <p>Try adjusting your search or station filter.</p>
        </div>
      ) : (
        <>
          {/* ── Table ── */}
          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  {/* Fixed columns */}
                  <Th col="worstStatus" label="Status"      style={{ width: 64, textAlign: 'center' }} />
                  <Th col="employeeId"  label="ID"          style={{ width: 70 }} />
                  <Th col="name"        label="Firefighter" style={{ minWidth: 130 }} />
                  <Th col="station"     label="Station"     style={{ minWidth: 90 }} />

                  {/* Gear type columns */}
                  {GEAR_COLS.map(g => (
                    <th key={g} className="rt-th rt-th-gear" style={{ minWidth: 105, textAlign: 'center' }}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </th>
                  ))}

                  <Th col="totalItems" label="Items"   style={{ width: 56, textAlign: 'center' }} />
                  <Th                  label=""         style={{ width: 48, textAlign: 'center' }} />
                </tr>
              </thead>

              <tbody>
                {pageRows.map((ff, rowIdx) => {
                  const wKey  = worstStatusKey(ff.gear);
                  const isExp = expandedKey === ff.key;
                  const rowBg = isExp ? '#F0F7FF' : '#fff';

                  // Plain-text status label for the Status column
                  const statusLabel = wKey === 'red'    ? 'Expired'
                                    : wKey === 'yellow' ? 'Expiring Soon'
                                    : wKey === 'green'  ? 'Active'
                                    : '—';

                  // matchedGear: null = FF-level match (no effects)
                  //              Set  = gear-level match (spotlight those cells)
                  const matchedGear    = matchMap[ff.key];
                  const isGearSearch   = matchedGear instanceof Set;

                  return (
                    <React.Fragment key={ff.key}>
                      {/* ── Firefighter row ── */}
                      <tr
                        className="rt-row"
                        style={{ background: rowBg }}
                        onClick={() => setExpandedKey(isExp ? null : ff.key)}
                      >
                        {/* Status — plain text */}
                        <td className="rt-td" style={{ textAlign: 'center', padding: '10px 6px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#0A1628' }}>
                            {statusLabel}
                          </span>
                        </td>

                        <td className="rt-td rt-mono" style={{ fontWeight: 700 }}>{ff.employeeId}</td>
                        <td className="rt-td" style={{ fontWeight: 800, color: '#0A1628' }}>{ff.name}</td>
                        <td className="rt-td">{ff.station}</td>

                        {/* ── Gear type cells ── */}
                        {GEAR_COLS.map(gType => {
                          const r       = ff.gear[gType];
                          const isMatch = isGearSearch && matchedGear.has(gType);
                          const isFaded = isGearSearch && !matchedGear.has(gType);

                          if (!r) {
                            return (
                              <td key={`${gType}-${isMatch ? 'hit' : 'no'}`}
                                className="rt-td gear-cell gear-empty"
                                style={{ opacity: isFaded ? 0.15 : 1, filter: isFaded ? 'grayscale(100%)' : 'none' }}>
                                <span className="gear-dash">—</span>
                              </td>
                            );
                          }

                          const days    = retirementDays(r.manufactureDate);
                          const retDate = calcRetirementDate(r.manufactureDate);

                          const tooltipText = [
                            `S/N: ${r.serialNumber || '—'}`,
                            `Mfg: ${r.manufactureDate || '—'}`,
                            retDate ? `Retires: ${fmtDate(retDate)}` : '',
                            days !== null ? (days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`) : '',
                          ].filter(Boolean).join('\n');

                          return (
                            <td
                              // Force remount when match state changes → replays entrance animation
                              key={`${gType}-${isMatch ? 'hit' : 'no'}`}
                              className={`rt-td gear-cell${isMatch ? ' gear-cell-match' : ''}`}
                              title={tooltipText}
                              style={{
                                background: isMatch ? '#2E86DE' : '#fff',
                                opacity:    isFaded ? 0.15 : 1,
                                filter:     isFaded ? 'grayscale(100%)' : 'none',
                                padding:    '7px 8px',
                                cursor:     'default',
                              }}
                            >
                              {isMatch && (
                                <>
                                  {/* Bouncing arrow above cell pointing down */}
                                  <span style={{
                                    position: 'absolute', top: -16, left: '50%',
                                    fontSize: 11, color: '#2E86DE', lineHeight: 1,
                                    animation: 'bounceArrow 0.9s ease-in-out infinite',
                                    pointerEvents: 'none', display: 'block',
                                  }}>▼</span>

                                  {/* Ripple ring — plays once on entrance */}
                                  <span style={{
                                    position: 'absolute', inset: -3,
                                    borderRadius: 4,
                                    border: '3px solid rgba(46,134,222,0.8)',
                                    animation: 'rippleOut 1.1s ease-out 0.1s forwards',
                                    pointerEvents: 'none',
                                  }} />

                                  {/* MATCH badge — white bg, blue text, flashes 3× */}
                                  <span style={{
                                    position: 'absolute', top: 2, right: 2,
                                    fontSize: 7, fontWeight: 900,
                                    background: '#fff', color: '#1a6db5',
                                    borderRadius: 3, padding: '1px 4px',
                                    letterSpacing: 0.5, textTransform: 'uppercase',
                                    lineHeight: 1.4,
                                    animation: 'matchBadgeFlash 1.2s ease-out forwards',
                                  }}>MATCH</span>
                                </>
                              )}

                              {/* Serial number — white on blue for match, dark otherwise */}
                              <div style={{
                                fontFamily: 'monospace',
                                fontSize: 10,
                                fontWeight: isMatch ? 800 : 600,
                                color: isMatch ? '#fff' : '#0A1628',
                                letterSpacing: -0.3,
                                lineHeight: 1.2,
                                marginTop: isMatch ? 8 : 0,
                              }}>
                                {r.serialNumber
                                  ? (r.serialNumber.length > 9 ? '…' + r.serialNumber.slice(-9) : r.serialNumber)
                                  : 'No S/N'}
                              </div>
                              {r.manufactureDate && (
                                <div style={{ fontSize: 9, color: isMatch ? 'rgba(255,255,255,0.75)' : '#718096', marginTop: 1 }}>
                                  {r.manufactureDate.slice(0, 7)}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Total items */}
                        <td className="rt-td" style={{ textAlign: 'center' }}>
                          <span style={{
                            fontWeight: 800, fontSize: 13, color: '#0A1628',
                          }}>
                            {ff.allGear.length}
                            <span style={{ fontSize: 9, color: '#9BA5B4', fontWeight: 500, display: 'block' }}>
                              /{GEAR_COLS.length}
                            </span>
                          </span>
                        </td>

                        {/* Expand toggle */}
                        <td className="rt-td" style={{ textAlign: 'center', padding: '8px 4px' }} onClick={e => e.stopPropagation()}>
                          <button
                            className="rt-action"
                            title={isExp ? 'Collapse' : 'View gear details'}
                            onClick={() => setExpandedKey(isExp ? null : ff.key)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              {isExp
                                ? <path d="M18 15l-6-6-6 6" />
                                : <path d="M6 9l6 6 6-6" />
                              }
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* ── Expanded gear detail panel ── */}
                      {isExp && (
                        <tr style={{ background: '#F0F7FF' }}>
                          <td colSpan={4 + GEAR_COLS.length + 2} style={{ padding: 0, borderBottom: '2px solid #2E86DE' }}>
                            <FFDetailPanel
                              ff={ff}
                              onClose={() => setExpandedKey(null)}
                              deleteRecord={deleteRecord}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="pagination">
            <button className="page-btn" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="page-info">Page</span>
              <select value={safePage} onChange={e => setPage(Number(e.target.value))} className="page-select">
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <span className="page-info">of {totalPages}</span>
            </div>
            <button className="page-btn" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Floating gear match card ──────────────────────────────────
const MEASURE_FIELDS = [
  { key: 'measureChest',  label: 'Chest'      },
  { key: 'measureFront',  label: 'Front'      },
  { key: 'measureBack',   label: 'Back'       },
  { key: 'measureSleeve', label: 'Sleeve'     },
  { key: 'measureWaist',  label: 'Waist'      },
  { key: 'measureInseam', label: 'Inseam'     },
  { key: 'measureHelmet', label: 'Helmet Size'},
  { key: 'measureGloves', label: 'Glove Size' },
  { key: 'measureBoots',  label: 'Boot Size'  },
];

function GearMatchCard({ record: r, onClose }) {
  const days     = retirementDays(r.manufactureDate);
  const rKey     = retirementStatusKey(days);
  const retDate  = calcRetirementDate(r.manufactureDate);
  const ct       = CELL_THEME[rKey];
  const over     = days !== null && days < 0;
  const measures = MEASURE_FIELDS.filter(f => r[f.key]);

  const statusIcon  = rKey === 'red' ? '🚨' : rKey === 'yellow' ? '⚠️' : '✅';
  const statusLabel = rKey === 'red' ? 'EXPIRED' : rKey === 'yellow' ? 'EXPIRING SOON' : 'ACTIVE';
  const daysLabel   = days === null ? '—'
    : over ? `${Math.abs(days)}d overdue` : `${days}d remaining`;

  function Field({ label, value, accent }) {
    return (
      <div>
        <div style={{
          fontSize: 8, fontWeight: 800, color: '#9BA5B4',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
        }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent || '#0A1628' }}>
          {value || '—'}
        </div>
      </div>
    );
  }

  return (
    <div className="match-card">
      {/* ── Header: dark navy gradient ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative',
      }}>
        {/* Gear type badge */}
        <div style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(46,134,222,0.5))' }}>
          <GearBadge type={r.gearType} size="lg" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: '#2E86DE',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
          }}>Gear Match Found</div>
          <div style={{
            fontSize: 22, fontWeight: 900, color: '#fff',
            letterSpacing: -0.5, textTransform: 'uppercase',
          }}>
            {r.gearType || 'Gear'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{r.name || '—'}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#2E86DE',
              background: 'rgba(46,134,222,0.2)',
              padding: '2px 9px', borderRadius: 6,
            }}>{r.employeeId || '—'}</span>
            {r.station && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {r.station}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          background: ct.accent, color: '#fff',
          borderRadius: 8, padding: '8px 14px',
          textAlign: 'center', flexShrink: 0,
          animation: rKey === 'red' ? 'pulseBadge 1.5s ease-in-out infinite' : 'none',
        }}>
          <div style={{ fontSize: 16 }}>{statusIcon}</div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.8, marginTop: 2 }}>{statusLabel}</div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginTop: 2 }}>{daysLabel}</div>
        </div>

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 12,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6, color: 'rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 700, padding: '3px 9px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>✕</button>
      </div>

      {/* ── Body: data grid ── */}
      <div style={{ padding: '18px 20px 14px' }}>
        {/* Row 1: serial / manufacturer / model */}
        <div className="match-card-grid" style={{ marginBottom: 16 }}>
          <Field label="Serial Number" value={r.serialNumber} accent="#0A1628" />
          <Field label="Manufacturer"  value={r.manufacturer} />
          <Field label="Model"         value={r.model} />
        </div>

        {/* Row 2: dates + NFPA */}
        <div className="match-card-grid" style={{ marginBottom: 16 }}>
          <Field label="Mfg. Date"      value={r.manufactureDate} />
          <Field label="Expiry Date"    value={retDate ? fmtDate(retDate) : null} accent={ct.accent} />
          <Field label="NFPA Standard"  value={r.nfpaStandard} />
        </div>

        {/* Row 3: retirement detail */}
        <div className="match-card-grid"
          style={{
            background: ct.bg, borderRadius: 8, padding: '12px 14px',
            border: `1px solid ${ct.border || '#E2E8F0'}`,
            marginBottom: measures.length > 0 ? 16 : 0,
          }}
        >
          <Field label="NFPA Retirement" value={retDate ? fmtDate(retDate) : null} accent={ct.accent} />
          <Field label="Days Remaining"  value={daysLabel} accent={ct.accent} />
          <Field label="Status"          value={`${statusIcon} ${statusLabel}`} accent={ct.accent} />
        </div>

        {/* Measurements (if any) */}
        {measures.length > 0 && (
          <div style={{
            background: '#F8FAFC', borderRadius: 8,
            padding: '12px 14px', border: '1px solid #E2E8F0',
          }}>
            <div style={{
              fontSize: 8, fontWeight: 800, color: '#9BA5B4',
              textTransform: 'uppercase', letterSpacing: 1,
              marginBottom: 10,
            }}>Size Measurements</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {measures.map(({ key, label }) => (
                <div key={key}>
                  <span style={{ fontSize: 10, color: '#718096', fontWeight: 600 }}>{label}: </span>
                  <span style={{ fontSize: 12, color: '#0A1628', fontWeight: 800 }}>{r[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Expanded firefighter detail panel ─────────────────────────
const DETAIL_FIELDS = [
  { key: 'manufacturer',    label: 'Manufacturer'  },
  { key: 'model',           label: 'Model'         },
  { key: 'serialNumber',    label: 'Serial #'      },
  { key: 'manufactureDate', label: 'Mfg. Date'     },
  { key: 'nfpaStandard',    label: 'NFPA'          },
  { key: 'complianceInfo',  label: 'Compliance'    },
  { key: 'inspectionInfo',  label: 'Inspection'    },
  { key: 'measureChest',    label: 'Chest'         },
  { key: 'measureFront',    label: 'Front'         },
  { key: 'measureBack',     label: 'Back'          },
  { key: 'measureSleeve',   label: 'Sleeve'        },
  { key: 'measureWaist',    label: 'Waist'         },
  { key: 'measureInseam',   label: 'Inseam'        },
  { key: 'measureHelmet',   label: 'Helmet Size'   },
  { key: 'measureGloves',   label: 'Glove Size'    },
  { key: 'measureBoots',    label: 'Boot Size'     },
];

function FFDetailPanel({ ff, onClose, deleteRecord }) {
  const [confirmDel, setConfirmDel] = useState(null);

  // Sort gear: worst status first, then alphabetically
  const gearItems = [...ff.allGear].sort((a, b) => {
    const ak = STATUS_PRI[retirementStatusKey(retirementDays(a.manufactureDate))];
    const bk = STATUS_PRI[retirementStatusKey(retirementDays(b.manufactureDate))];
    if (ak !== bk) return ak - bk;
    return (a.gearType || '').localeCompare(b.gearType || '');
  });

  return (
    <div className="rt-detail-panel">
      {/* Header */}
      <div className="rt-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#0A1628', fontSize: 15 }}>
            {ff.name}
          </span>
          <span style={{
            background: '#EBF4FF', color: '#1A6BBF',
            borderRadius: 6, padding: '2px 10px',
            fontSize: 11, fontWeight: 700,
          }}>
            {ff.employeeId}
          </span>
          <span style={{ fontSize: 12, color: '#4A5568' }}>{ff.station}</span>
          <span style={{ fontSize: 11, color: '#9BA5B4' }}>
            {gearItems.length} gear record{gearItems.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className="rt-detail-close" onClick={onClose}>✕ Close</button>
      </div>

      {/* Gear cards grid */}
      <div className="ff-gear-grid">
        {gearItems.map(r => {
          const days    = retirementDays(r.manufactureDate);
          const rKey    = retirementStatusKey(days);
          const ct      = CELL_THEME[rKey];
          const retDate = calcRetirementDate(r.manufactureDate);
          const over    = days !== null && days < 0;
          const isConf  = confirmDel === r.id;

          return (
            <div key={r.id} className="gear-detail-card" style={{
              borderLeft: `4px solid ${ct.accent}`,
              background: ct.bg,
              border: `1px solid ${ct.border}`,
              borderLeft: `4px solid ${ct.accent}`,
            }}>
              {/* Gear type + status badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: ct.text,
                    textTransform: 'uppercase', letterSpacing: 0.8,
                  }}>
                    {r.gearType || 'Gear'}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: ct.accent,
                    background: ct.accent + '18',
                    borderRadius: 20, padding: '2px 7px',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    animation: rKey === 'red' ? 'pulseBadge 1.8s ease-in-out infinite' : 'none',
                  }}>
                    {rKey === 'red'    ? '🚨 EXPIRED'
                   : rKey === 'yellow' ? '⚠️ Expiring Soon'
                   : rKey === 'green'  ? '✅ Active'
                   : '—'}
                  </span>
                </div>
                {/* Delete button */}
                {deleteRecord && (
                  isConf ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          background: '#C41E3A', color: '#fff',
                          border: 'none', borderRadius: 4,
                          padding: '3px 8px', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onClick={() => { deleteRecord(r.id); setConfirmDel(null); }}
                      >
                        Delete
                      </button>
                      <button
                        style={{
                          background: '#F8FAFC', color: '#4A5568',
                          border: '1px solid #E2E8F0', borderRadius: 4,
                          padding: '3px 8px', fontSize: 11,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onClick={() => setConfirmDel(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      title="Delete this record"
                      style={{
                        background: 'none', border: 'none', padding: 4,
                        cursor: 'pointer', color: '#CBD5E0',
                        display: 'flex', alignItems: 'center',
                      }}
                      onClick={() => setConfirmDel(r.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  )
                )}
              </div>

              {/* Field list */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                {DETAIL_FIELDS.map(({ key, label }) =>
                  r[key] ? (
                    <div key={key}>
                      <div style={{
                        fontSize: 8, fontWeight: 800, color: '#9BA5B4',
                        textTransform: 'uppercase', letterSpacing: 0.8,
                      }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, color: '#0A1628', fontWeight: 500, wordBreak: 'break-word' }}>
                        {r[key]}
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              {/* NFPA retirement row */}
              {retDate && (
                <div style={{
                  marginTop: 10, paddingTop: 8,
                  borderTop: `1px solid ${ct.border || '#E2E8F0'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#9BA5B4', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      NFPA Retirement
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: ct.text }}>
                      {fmtDate(retDate)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: over ? '#C41E3A' : '#718096',
                    textAlign: 'right',
                  }}>
                    {days !== null && days < 0
                      ? `${Math.abs(days)}d overdue`
                      : days !== null
                      ? `${days}d remaining`
                      : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
