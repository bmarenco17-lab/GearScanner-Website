import React, { useState, useMemo } from 'react';

// ── NFPA 1850 checklist content ─────────────────────────────────
const ENSEMBLE_ELEMENTS = [
  'Helmet',
  'Hood',
  'Coat (Shell/Liner)',
  'Pants (Shell/Liner)',
  'Gloves',
  'Boots',
  'SCBA Facepiece',
  'SCBA Cylinder',
  'SCBA Harness/Regulator',
  'PASS Device',
];

const ROUTINE_INSPECTION = [
  'No visible damage, rips, tears, or cuts to outer shell, liner, or moisture barrier',
  'Reflective trim is intact, securely attached, and reflective (not dull or peeling)',
  'All hardware (zippers, snaps, hooks, D-rings) functions smoothly and is not corroded',
  'No char, melting, burns, or heat damage to any layer',
  'Seams and stitching are intact with no separation or broken threads',
  'Hood is free of holes, shrinkage, and contamination; face opening sized correctly',
  'Gloves show no holes, seam separation, or stiffness affecting dexterity',
  'Boots: soles, steel/composite toe, and waterproofing intact; no cracking',
  'SCBA facepiece lens is clear, undamaged, and seal/straps are intact',
  'SCBA cylinder pressure is at or above operational minimum and within hydro date',
  'PASS device activates, alarms correctly, and battery is within service life',
  'No lingering odors, visible soiling, or contamination present',
  'All labels (size, manufacture date, certification) are legible',
];

const ADVANCED_CLEANING = [
  'Advanced (machine or hand) cleaning completed using approved detergent and verified water quality',
  'Advanced inspection completed by a certified/trained PPE technician',
  'Moisture barrier integrity verified (light test or equivalent method)',
  'Thermal liner inspected for damage, shrinkage, or loss of loft',
  'Trim reflectivity tested and meets minimum retroreflectivity requirements',
  'Garment dried and decontaminated per manufacturer instructions',
  'SCBA flow-tested and regulator function verified per manufacturer schedule',
  'Repairs (if needed) completed by an ISP-verified or manufacturer-authorized facility',
  'Inspection results, date, and technician name logged in gear records',
  'Gear with damage beyond repair flagged for retirement and removed from service',
];

const PROGRAM_COMPLIANCE = [
  'A designated PPE Program Coordinator (PPC Manager) has been appointed',
  'Written SOPs cover selection, care, cleaning, inspection, repair, and retirement',
  'Individual records are maintained for every ensemble element, including loaner/rental gear',
  'Routine inspections are documented after each use or monthly, whichever is sooner',
  'Advanced cleaning and inspection are scheduled and tracked at least annually',
  'Retirement dates (10 years from manufacture) are tracked for every element',
  'Gear assigned to each firefighter is logged and updated when equipment changes',
  'Contaminated or damaged gear is quarantined and not returned to service until cleared',
  'SCBA cylinders are tracked for hydrostatic test dates and service intervals',
  'Budget plan accounts for scheduled replacements as elements approach retirement',
];

const SECTIONS = [
  { id: 'routine',    title: '2. Routine Inspection (After Every Use / Monthly)', items: ROUTINE_INSPECTION,
    blurb: 'Perform a routine inspection after each use and at least monthly, even if unused.' },
  { id: 'advanced',   title: '3. Advanced Cleaning & Inspection (At Least Annually)', items: ADVANCED_CLEANING,
    blurb: 'NFPA 1850 requires advanced cleaning and a documented advanced inspection at least once every 12 months, performed by a trained PPE technician.' },
  { id: 'compliance', title: '4. Department Program Compliance', items: PROGRAM_COMPLIANCE,
    blurb: 'Department-level checks to confirm an active NFPA 1850 PPE program is in place.' },
];

const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export default function ChecklistScreen() {
  const [checked, setChecked] = useState({});
  const [inventory, setInventory] = useState(
    () => Object.fromEntries(ENSEMBLE_ELEMENTS.map(el => [el, '']))
  );

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const toggle = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateInventory = (el, val) => {
    setInventory(prev => ({ ...prev, [el]: val }));
  };

  const resetAll = () => {
    setChecked({});
    setInventory(Object.fromEntries(ENSEMBLE_ELEMENTS.map(el => [el, ''])));
  };

  const pct = TOTAL_ITEMS ? Math.round((checkedCount / TOTAL_ITEMS) * 100) : 0;

  return (
    <div className="screen">
      {/* Header card */}
      <div className="card">
        <div className="card-title">📋 NFPA 1850 Gear Inventory &amp; Compliance Checklist</div>
        <p className="text-muted" style={{ marginBottom: 14, lineHeight: 1.6 }}>
          Track every PPE ensemble element, plan inspections, and stay ahead of 10-year
          retirement deadlines in line with NFPA 1850 (Selection, Care, and Maintenance of
          Protective Ensembles and SCBA).
        </p>

        {/* Progress */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
        }}>
          <div style={{
            flex: 1, height: 8, borderRadius: 4,
            background: 'var(--border)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'var(--blue)', borderRadius: 4,
              transition: 'width 0.2s',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
            {checkedCount}/{TOTAL_ITEMS} done
          </span>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={resetAll} style={{ marginTop: 10 }}>
          Reset Checklist
        </button>
      </div>

      {/* Ensemble inventory */}
      <div className="card">
        <div className="card-title">1. PPE Ensemble Element Inventory</div>
        <p className="text-muted" style={{ marginBottom: 14, lineHeight: 1.6 }}>
          Record the size or serial info for every ensemble element assigned. NFPA 1850
          sets a maximum 10-year service life from the date of manufacture for structural
          turnout gear and ensemble elements.
        </p>

        {ENSEMBLE_ELEMENTS.map(el => (
          <div className="field" key={el}>
            <label>{el}</label>
            <input
              type="text"
              placeholder="Mfr / model / serial / size"
              value={inventory[el]}
              onChange={(e) => updateInventory(el, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Checklist sections */}
      {SECTIONS.map(section => (
        <div className="card" key={section.id}>
          <div className="card-title">{section.title}</div>
          <p className="text-muted" style={{ marginBottom: 14, lineHeight: 1.6 }}>
            {section.blurb}
          </p>
          {section.items.map((item, i) => {
            const key = `${section.id}-${i}`;
            const isChecked = !!checked[key];
            return (
              <label
                key={key}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(key)}
                  style={{
                    width: 20, height: 20, marginTop: 1, flexShrink: 0,
                    accentColor: 'var(--blue)', cursor: 'pointer',
                  }}
                />
                <span style={{
                  fontSize: 14, lineHeight: 1.55,
                  color: isChecked ? 'var(--text-2)' : 'var(--text)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                }}>
                  {item}
                </span>
              </label>
            );
          })}
        </div>
      ))}

      {/* Footer note */}
      <div className="card">
        <p className="text-muted" style={{ lineHeight: 1.6, fontSize: 12 }}>
          This checklist is provided as a general reference based on NFPA 1850 (Standard on
          Selection, Care, and Maintenance of Protective Ensembles for Structural and Proximity
          Firefighting and Open-Circuit SCBA). It does not replace the full standard,
          manufacturer instructions, or your department's official SOPs. Always consult the
          current edition of NFPA 1850 and your equipment manufacturers for complete
          requirements.
        </p>
      </div>
    </div>
  );
}
