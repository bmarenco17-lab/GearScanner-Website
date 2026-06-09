import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EmployeeInfoStep({ value, onChange, onNext }) {
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);

  // Start QR/barcode scanner
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 12,
        qrbox: { width: 260, height: 160 },
        supportedScanTypes: [0, 1], // QR + barcode
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onChange((prev) => ({ ...prev, employeeId: decodedText }));
        scanner.clear().catch(() => {});
        setShowScanner(false);
      },
      () => {} // ignore scan errors
    );

    scannerRef.current = scanner;
    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [showScanner]);

  const closeScanner = () => {
    scannerRef.current?.clear().catch(() => {});
    setShowScanner(false);
  };

  const canContinue = value.employeeId.trim().length > 0;

  return (
    <>
      {showScanner && (
        <div className="qr-overlay">
          <p style={{ color: '#fff', marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
            Aim at your badge barcode or QR code
          </p>
          <div id="qr-reader" />
          <button className="qr-close-btn" onClick={closeScanner}>Cancel</button>
        </div>
      )}

      <div className="screen">
        {/* Icon */}
        <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 12,
            background: '#2E86DE', fontSize: 36, marginBottom: 12,
            boxShadow: '0 4px 16px rgba(46,134,222,0.35)',
          }}>🛡️</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0A1628' }}>Firefighter Check-In</div>
          <div style={{ fontSize: 14, color: '#4A5568', marginTop: 4, fontWeight: 500 }}>Step 1 of 3</div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">👤 Employee Information</div>

          <div className="field">
            <label>Employee ID *</label>
            <div className="input-row">
              <input
                type="text"
                placeholder="e.g. FF-12345"
                value={value.employeeId}
                onChange={(e) => onChange({ ...value, employeeId: e.target.value })}
                autoCapitalize="characters"
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowScanner(true)}
                title="Scan badge barcode"
              >
                📷 Scan
              </button>
            </div>
          </div>

          <div className="field">
            <label>Firefighter Name</label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Station</label>
            <input
              type="text"
              placeholder="e.g. Station 7"
              value={value.station}
              onChange={(e) => onChange({ ...value, station: e.target.value })}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canContinue}
        >
          Continue to Gear Scan →
        </button>
      </div>
    </>
  );
}
