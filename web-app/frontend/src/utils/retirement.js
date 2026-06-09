// ── Shared retirement calculation utilities ──────────────────
// NFPA rule: gear must be retired 10 years from manufacture date.
//
// STATUS SYSTEM (3 statuses):
//   green  = Active       — 180+ days until retirement
//   yellow = Expiring Soon — 1–179 days until retirement
//   red    = Expired      — past retirement date
//   unknown = No mfg date on file

/** Parse a date string in the formats Claude typically returns. */
export function parseDateStr(str) {
  if (!str) return null;
  str = str.trim();
  let m;
  m = str.match(/^(\d{1,2})\/(\d{4})$/);           if (m) return new Date(+m[2], +m[1]-1, 1);
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return new Date(+m[3], +m[1]-1, +m[2]);
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);       if (m) return new Date(+m[1], +m[2]-1, +m[3]);
  m = str.match(/^([A-Za-z]+)[.\s,]+(\d{4})$/);
  if (m) {
    const idx = 'janfebmaraprmayjunjulaugsepoctnovdec'.indexOf(m[1].toLowerCase().slice(0,3)) / 3;
    if (idx >= 0) return new Date(+m[2], idx, 1);
  }
  m = str.match(/^\d{4}$/); if (m) return new Date(+str, 0, 1);
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

/** Return the NFPA retirement date (mfg + 10 years), or null. */
export function calcRetirementDate(mfgDateStr) {
  const d = parseDateStr(mfgDateStr);
  if (!d) return null;
  return new Date(d.getFullYear() + 10, d.getMonth(), d.getDate());
}

/** Days until retirement (negative = overdue). Returns null if no mfg date. */
export function retirementDays(mfgDateStr) {
  const r = calcRetirementDate(mfgDateStr);
  if (!r) return null;
  return Math.floor((r - Date.now()) / 86400000);
}

/** Status key based on days until retirement.
 *  green  = 180+ days   (Active)
 *  yellow = 0–179 days  (Expiring Soon)
 *  red    = expired     (past 10-year date)
 *  unknown = no mfg date
 */
export function retirementStatusKey(days) {
  if (days === null) return 'unknown';
  if (days < 0)      return 'red';     // expired
  if (days < 180)    return 'yellow';  // expiring soon (< 6 months)
  return 'green';                      // active
}

/** Human-readable status label. */
export function retirementStatusLabel(days) {
  if (days === null) return 'Unknown Mfg Date';
  if (days < 0)      return 'Expired';
  if (days < 180)    return 'Expiring Soon';
  return 'Active';
}

/** Format a Date object as "Mon YYYY". */
export function fmtDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Color palette for retirement statuses. */
export const RET_STATUS = {
  green:   { bar: '#1A8A4A', badge: '#1A8A4A', label: 'Active'        },
  yellow:  { bar: '#D97706', badge: '#D97706', label: 'Expiring Soon' },
  red:     { bar: '#C41E3A', badge: '#C41E3A', label: 'Expired'       },
  unknown: { bar: '#CBD5E0', badge: '#718096', label: 'No Mfg Date'   },
};
