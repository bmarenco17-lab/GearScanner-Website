import React, { useState, useEffect, useRef } from 'react';
import { retirementDays, calcRetirementDate, fmtDate } from '../utils/retirement.js';

const FIELDS = [
  { key: 'manufacturer',    label: 'Manufacturer'           },
  { key: 'model',           label: 'Model / Style #'        },
  { key: 'gearType',        label: 'Gear Type'              },
  { key: 'measureChest',    label: 'Chest'                  },
  { key: 'measureFront',    label: 'Front'                  },
  { key: 'measureBack',     label: 'Back'                   },
  { key: 'measureSleeve',   label: 'Sleeve'                 },
  { key: 'measureInseam',   label: 'Inseam'                 },
  { key: 'measureWaist',    label: 'Waist'                  },
  { key: 'measureHelmet',   label: 'Hat / Helmet Size'      },
  { key: 'measureGloves',   label: 'Glove Size'             },
  { key: 'measureBoots',    label: 'Boot Size'              },
  { key: 'nfpaStandard',    label: 'NFPA Standard'          },
  { key: 'complianceInfo',  label: 'Compliance Info',  multiline: true },
  { key: 'manufactureDate', label: 'Manufacture Date'       },
  { key: 'expirationDate',  label: 'Service Life Expiration'},
  { key: 'serialNumber',    label: 'Serial / Lot #'         },
  { key: 'inspectionInfo',  label: 'Inspection / ISP Info', multiline: true },
];

// ── Shared modal shell ───────────────────────────────────────
function ModalShell({ onBackdropClick, children }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current && onBackdropClick) onBackdropClick(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(10,22,40,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeInOverlay 0.2s ease',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: 520,
        padding: '28px 24px 36px',
        animation: 'slideUpModal 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.28)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 24px' }} />
        {children}
      </div>
    </div>
  );
}

// ── Row helper ───────────────────────────────────────────────
function Row({ icon, label, value, last, accentColor = '#C41E3A' }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      paddingBottom: last ? 0 : 10, marginBottom: last ? 0 : 10,
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1628', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function DetailCard({ accentColor, headerLabel, children }) {
  return (
    <div style={{
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 8, padding: '16px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
        {headerLabel}
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({ onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '16px', borderRadius: 8, border: 'none',
      background: color, color: '#fff', fontSize: 16, fontWeight: 700,
      cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit',
      boxShadow: `0 4px 16px ${color}44`,
    }}>{children}</button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '16px', borderRadius: 8,
      border: '2px solid #E2E8F0', background: '#fff',
      color: '#4A5568', fontSize: 15, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function Footnote({ text }) {
  return <p style={{ textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 12 }}>{text}</p>;
}

// ── Retirement modal ─────────────────────────────────────────
function RetirementModal({ fields, daysOverdue, retirementDate, onDoNotSave, onSaveAnyway }) {
  const yearsOverdue = (Math.abs(daysOverdue) / 365).toFixed(1);
  return (
    <ModalShell>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 36, background: '#FFF0F3', marginBottom: 14,
        }}>
          <span style={{ fontSize: 38 }}>🚨</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#C41E3A', marginBottom: 6, letterSpacing: -0.3 }}>
          Gear Retirement Required
        </div>
        <div style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.6 }}>
          This gear has exceeded its 10-year NFPA service life and must be retired immediately.
        </div>
      </div>

      <div style={{ height: 1, background: '#E2E8F0', margin: '16px 0' }} />

      <DetailCard accentColor="#C41E3A" headerLabel="Retirement Details">
        <Row icon="🧰" label="Gear Type"       value={fields.gearType || '—'}      accentColor="#C41E3A" />
        <Row icon="🏭" label="Manufacturer"     value={fields.manufacturer || '—'}  accentColor="#C41E3A" />
        <Row icon="📅" label="Manufacture Date" value={fields.manufactureDate || '—'} accentColor="#C41E3A" />
        <Row icon="⏰" label="Retirement Date"  value={fmtDate(retirementDate)}     accentColor="#C41E3A" />
        <Row icon="🚨" label="Status"           value={`${yearsOverdue} yrs overdue (${Math.abs(daysOverdue)} days)`} accentColor="#C41E3A" last />
      </DetailCard>

      <div style={{ background: '#C41E3A', borderRadius: 8, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>
          ⚠️ This gear is {yearsOverdue} years past its retirement date
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Per NFPA 1850, gear must not be used after 10 years from manufacture.
        </div>
      </div>

      <PrimaryBtn onClick={onDoNotSave} color="#C41E3A">🚫 Do Not Save — Retire This Gear</PrimaryBtn>
      <GhostBtn onClick={onSaveAnyway}>Save Anyway — Override Retirement</GhostBtn>
      <Footnote text="Override is recorded with the scan. Use only with supervisor approval." />
    </ModalShell>
  );
}

// ── Duplicate Serial Number modal (red) ──────────────────────
function SerialDuplicateModal({ duplicate, onCancel, onSaveAnyway }) {
  const scannedOn = duplicate.timestamp
    ? new Date(duplicate.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  return (
    <ModalShell onBackdropClick={onCancel}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 36, background: '#FFF0F3', marginBottom: 14,
        }}>
          <span style={{ fontSize: 38 }}>🔴</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#C41E3A', marginBottom: 6, letterSpacing: -0.3 }}>
          Duplicate Serial Number
        </div>
        <div style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.6 }}>
          This serial number is already assigned to gear in the system.
        </div>
      </div>

      <div style={{ height: 1, background: '#E2E8F0', margin: '16px 0' }} />

      <DetailCard accentColor="#C41E3A" headerLabel="Currently Assigned To">
        <Row icon="👤" label="Firefighter" value={duplicate.name || '—'}        accentColor="#C41E3A" />
        <Row icon="🪪" label="Employee ID" value={duplicate.employeeId || '—'}  accentColor="#C41E3A" />
        <Row icon="🏢" label="Station"     value={duplicate.station || '—'}     accentColor="#C41E3A" />
        <Row icon="🧰" label="Gear Type"   value={duplicate.gearType || '—'}    accentColor="#C41E3A" />
        <Row icon="📅" label="Scanned On"  value={scannedOn}                    accentColor="#C41E3A" last />
      </DetailCard>

      {/* Serial number pill */}
      <div style={{
        background: '#FFF0F3', border: '1px solid #FFBDCA', borderRadius: 8,
        padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#C41E3A', textTransform: 'uppercase', letterSpacing: 0.8 }}>Serial #</span>
        <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: '#0A1628' }}>
          {duplicate.serialNumber}
        </span>
      </div>

      <PrimaryBtn onClick={onCancel} color="#C41E3A">Cancel Scan</PrimaryBtn>
      <GhostBtn onClick={onSaveAnyway}>Save Anyway — Gear Reassigned</GhostBtn>
      <Footnote text="Choose 'Save Anyway' only if this gear was intentionally reassigned." />
    </ModalShell>
  );
}

// ── Duplicate Gear Assignment modal (orange) ─────────────────
function GearDuplicateModal({ duplicate, onCancel, onSaveAnyway }) {
  const scannedOn = duplicate.timestamp
    ? new Date(duplicate.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  return (
    <ModalShell onBackdropClick={onCancel}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 36, background: '#FFF8ED', marginBottom: 14,
        }}>
          <span style={{ fontSize: 38 }}>🟠</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#C2510A', marginBottom: 6, letterSpacing: -0.3 }}>
          Duplicate Gear Assignment
        </div>
        <div style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.6 }}>
          This firefighter already has a <strong>{duplicate.gearType || 'gear'}</strong> record on file.
        </div>
      </div>

      <div style={{ height: 1, background: '#E2E8F0', margin: '16px 0' }} />

      <DetailCard accentColor="#EA580C" headerLabel="Existing Gear Record">
        <Row icon="👤" label="Firefighter"      value={duplicate.name || '—'}                                      accentColor="#EA580C" />
        <Row icon="🪪" label="Employee ID"      value={duplicate.employeeId || '—'}                                accentColor="#EA580C" />
        <Row icon="🧰" label="Gear Type"        value={duplicate.gearType || '—'}                                  accentColor="#EA580C" />
        <Row icon="🏭" label="Manufacturer"     value={[duplicate.manufacturer, duplicate.model].filter(Boolean).join(' · ') || '—'} accentColor="#EA580C" />
        <Row icon="🔢" label="Serial Number"    value={duplicate.serialNumber || '—'}                              accentColor="#EA580C" />
        <Row icon="📅" label="Scanned On"       value={scannedOn}                                                  accentColor="#EA580C" last />
      </DetailCard>

      {/* Context callout */}
      <div style={{
        background: '#FFF8ED', border: '1px solid #FED7AA',
        borderRadius: 8, padding: '12px 16px', marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: '#7C3A0A', lineHeight: 1.5, fontWeight: 500 }}>
          Saving will create a second {duplicate.gearType || 'gear'} record for this firefighter.
          Choose "Replacing Old Gear" if the old gear is being swapped out.
        </div>
      </div>

      <PrimaryBtn onClick={onCancel} color="#EA580C">Cancel Scan</PrimaryBtn>
      <GhostBtn onClick={onSaveAnyway}>Save Anyway — Replacing Old Gear</GhostBtn>
      <Footnote text="Choose 'Save Anyway' only if this firefighter's gear is being replaced." />
    </ModalShell>
  );
}

// ── Main component ───────────────────────────────────────────
export default function ReviewStep({ employeeInfo, gearInfo, extractedData, records = [], onSave, onBack }) {
  const [fields, setFields] = useState({ ...extractedData });
  // 'none' | 'retirement' | 'serialDup' | 'gearDup'
  const [activeModal, setActiveModal] = useState('none');

  const update = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));

  // ── Retirement (derived) ────────────────────────────────────
  const retDays      = retirementDays(fields.manufactureDate);
  const retDate      = calcRetirementDate(fields.manufactureDate);
  const isRetiredOut = retDays !== null && retDays < 0;

  // ── Effective gear type (field or scan step selection) ──────
  const effectiveGearType = (fields.gearType || gearInfo.gearType || '').trim().toLowerCase();

  // ── Duplicate detection (reactive) ─────────────────────────
  const serialDuplicate = (() => {
    const serial = (fields.serialNumber || '').trim();
    if (!serial) return null;
    return records.find(
      (r) => r.serialNumber && r.serialNumber.trim().toLowerCase() === serial.toLowerCase()
    ) || null;
  })();

  const gearDuplicate = (() => {
    const empId = (employeeInfo.employeeId || '').trim().toLowerCase();
    if (!empId || !effectiveGearType) return null;
    return records.find(
      (r) =>
        r.employeeId && r.employeeId.trim().toLowerCase() === empId &&
        r.gearType   && r.gearType.trim().toLowerCase()   === effectiveGearType
    ) || null;
  })();

  const hasSerialDup = !!serialDuplicate;
  const hasGearDup   = !!gearDuplicate;
  const hasDuplicate = hasSerialDup || hasGearDup;

  // ── Save flow ───────────────────────────────────────────────
  // Priority: retirement → serial duplicate → gear duplicate → save
  const handleSaveClick = () => {
    if (isRetiredOut)    return setActiveModal('retirement');
    if (hasSerialDup)    return setActiveModal('serialDup');
    if (hasGearDup)      return setActiveModal('gearDup');
    commitSave();
  };

  // After retirement override: still check duplicates
  const handleRetirementOverride = () => {
    setActiveModal('none');
    if (hasSerialDup) return setActiveModal('serialDup');
    if (hasGearDup)   return setActiveModal('gearDup');
    commitSave();
  };

  // After serial duplicate override: still check gear duplicate
  const handleSerialDupOverride = () => {
    setActiveModal('none');
    if (hasGearDup) return setActiveModal('gearDup');
    commitSave();
  };

  const commitSave = () => {
    setActiveModal('none');
    onSave({
      ...fields,
      gearType: fields.gearType || gearInfo.gearType,
      photoDataUrl: gearInfo.photoDataUrl,
      retirementOverride: isRetiredOut ? true : undefined,
    });
  };

  const canSave = fields.manufacturer || fields.serialNumber;

  // ── Save button label ───────────────────────────────────────
  const saveLabel = isRetiredOut
    ? '🚨 Save (Retirement Required)'
    : hasSerialDup
    ? '🔴 Save (Duplicate Serial Number)'
    : hasGearDup
    ? '🟠 Save (Duplicate Gear Assignment)'
    : '💾 Save to Records';

  return (
    <>
      {/* ── Retirement modal ── */}
      {activeModal === 'retirement' && (
        <RetirementModal
          fields={fields}
          daysOverdue={retDays}
          retirementDate={retDate}
          onDoNotSave={() => { setActiveModal('none'); onBack(); }}
          onSaveAnyway={handleRetirementOverride}
        />
      )}

      {/* ── Serial number duplicate modal (red) ── */}
      {activeModal === 'serialDup' && serialDuplicate && (
        <SerialDuplicateModal
          duplicate={serialDuplicate}
          onCancel={() => { setActiveModal('none'); onBack(); }}
          onSaveAnyway={handleSerialDupOverride}
        />
      )}

      {/* ── Gear assignment duplicate modal (orange) ── */}
      {activeModal === 'gearDup' && gearDuplicate && (
        <GearDuplicateModal
          duplicate={gearDuplicate}
          onCancel={() => { setActiveModal('none'); onBack(); }}
          onSaveAnyway={commitSave}
        />
      )}

      <div className="screen">
        {/* Employee badge */}
        <div className="review-badge" style={{ marginTop: 12 }}>
          <div>
            <div className="emp-id">👤 {employeeInfo.employeeId}</div>
            {employeeInfo.name && <div style={{ fontSize: 14, color: '#4A5568', marginTop: 3, fontWeight: 500 }}>{employeeInfo.name}</div>}
          </div>
          {employeeInfo.station && <span className="station">{employeeInfo.station}</span>}
        </div>

        {/* Inline duplicate warnings (above the form) */}
        {hasSerialDup && (
          <div style={{
            background: '#FFF0F3', border: '1px solid #FFBDCA', borderLeft: '4px solid #C41E3A',
            borderRadius: 8, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🔴</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#C41E3A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Duplicate Serial Number
              </div>
              <div style={{ fontSize: 13, color: '#7C2D3E', fontWeight: 500 }}>
                S/N already assigned to {serialDuplicate.name || serialDuplicate.employeeId}
                {serialDuplicate.station ? ` · ${serialDuplicate.station}` : ''}
              </div>
            </div>
          </div>
        )}

        {hasGearDup && !hasSerialDup && (
          <div style={{
            background: '#FFF8ED', border: '1px solid #FED7AA', borderLeft: '4px solid #EA580C',
            borderRadius: 8, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🟠</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#C2510A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Duplicate Gear Assignment
              </div>
              <div style={{ fontSize: 13, color: '#7C3A0A', fontWeight: 500 }}>
                {employeeInfo.employeeId} already has a {gearDuplicate.gearType} on record
              </div>
            </div>
          </div>
        )}

        {/* Label photo thumbnail */}
        {gearInfo.photoDataUrl && (
          <img
            src={gearInfo.photoDataUrl}
            alt="Label"
            style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 14, border: '1px solid #E2E8F0' }}
          />
        )}

        <div className="card">
          <div className="card-title">✏️ Review Extracted Data</div>
          <p style={{ fontSize: 14, color: '#4A5568', marginBottom: 18, lineHeight: 1.6, fontWeight: 500 }}>
            Fields highlighted in blue were extracted by AI. Correct anything that's wrong before saving.
          </p>

          {FIELDS.map(({ key, label, multiline }) => {
            const isSerial  = key === 'serialNumber';
            const isGear    = key === 'gearType';
            const showSerialWarn = isSerial && hasSerialDup && fields[key];
            const showGearWarn   = isGear   && hasGearDup   && (fields[key] || gearInfo.gearType);

            const warnStyle = showSerialWarn
              ? { borderColor: '#C41E3A', background: '#FFF0F3', boxShadow: '0 0 0 3px rgba(196,30,58,0.12)' }
              : showGearWarn
              ? { borderColor: '#EA580C', background: '#FFF8ED', boxShadow: '0 0 0 3px rgba(234,88,12,0.12)' }
              : {};

            const badgeLabel = showSerialWarn ? '🔴 DUPLICATE S/N'
                             : showGearWarn   ? '🟠 DUPLICATE GEAR'
                             : null;
            const badgeBg    = showSerialWarn ? '#C41E3A' : '#EA580C';

            return (
              <div className="field" key={key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {label}
                  {badgeLabel && (
                    <span style={{
                      background: badgeBg, color: '#fff',
                      fontSize: 10, fontWeight: 800, borderRadius: 4,
                      padding: '2px 8px', letterSpacing: 0.5,
                      animation: 'pulseBadge 1.5s ease-in-out infinite',
                    }}>
                      {badgeLabel}
                    </span>
                  )}
                </label>
                {multiline ? (
                  <textarea
                    className={fields[key] ? 'populated' : ''}
                    value={fields[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}…`}
                    rows={3}
                    style={warnStyle}
                  />
                ) : (
                  <input
                    type="text"
                    className={fields[key] ? 'populated' : ''}
                    value={fields[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}…`}
                    style={warnStyle}
                  />
                )}
              </div>
            );
          })}
        </div>

        {!canSave && (
          <div style={{ color: '#C41E3A', fontSize: 14, marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
            Fill in at least Manufacturer or Serial Number to save.
          </div>
        )}

        <button
          className={`btn ${(isRetiredOut || hasDuplicate) ? 'btn-primary' : 'btn-green'}`}
          onClick={handleSaveClick}
          disabled={!canSave}
          style={{
            marginBottom: 0,
            background: hasSerialDup ? '#C41E3A' : hasGearDup ? '#EA580C' : undefined,
          }}
        >
          {saveLabel}
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Rescan Label
        </button>
      </div>
    </>
  );
}
