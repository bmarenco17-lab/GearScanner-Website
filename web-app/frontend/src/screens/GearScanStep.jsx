import React, { useState, useRef } from 'react';
import axios from 'axios';

// Use ⛑️ for helmet (accurate safety/rescue helmet) and 🧥 for coat.
// All other gear types use a navy text pill — more professional than
// using wrong emojis (no cowboy boots, fashion gloves, theater masks).
const GEAR_TYPES = [
  { id: 'coat',    emoji: '🧥',  label: 'Coat'    },
  { id: 'pants',   pill: 'PANT', label: 'Pants'   },
  { id: 'helmet',  emoji: '⛑️',  label: 'Helmet'  },
  { id: 'gloves',  pill: 'GLVS', label: 'Gloves'  },
  { id: 'boots',   pill: 'BOOT', label: 'Boots'   },
  { id: 'hood',    pill: 'HOOD', label: 'Hood'    },
  { id: 'other',   emoji: '📦',  label: 'Other'   },
];

function GearTypeIcon({ item, size = 24 }) {
  if (item.emoji) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{item.emoji}</span>;
  }
  return (
    <span style={{
      background: '#0A1628', color: '#fff',
      fontSize: size * 0.38, fontWeight: 900,
      letterSpacing: 0.8, textTransform: 'uppercase',
      borderRadius: 4, padding: '3px 6px',
      display: 'inline-block', lineHeight: 1.3,
    }}>
      {item.pill}
    </span>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the data URI prefix (e.g. "data:image/jpeg;base64,")
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, dataUrl, mediaType: file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GearScanStep({ value, onChange, employeeInfo, onNext, onBack }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    try {
      const { base64, dataUrl, mediaType } = await fileToBase64(file);
      onChange({ ...value, photoBase64: base64, photoDataUrl: dataUrl, mediaType });
    } catch {
      setError('Could not read image file. Try again.');
    }
  };

  const analyze = async () => {
    if (!value.photoBase64) return;
    setAnalyzing(true);
    setError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${apiBase}/api/scan-label`, {
        base64Image: value.photoBase64,
        mediaType: value.mediaType,
      });
      if (res.data.success) {
        onNext(res.data.data);
      } else {
        throw new Error(res.data.error || 'Analysis failed');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError('Analysis failed: ' + msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze = value.gearType && value.photoBase64 && !analyzing;

  return (
    <div>
      {/* ── Hero image ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 200,
        overflow: 'hidden',
        borderRadius: '0 0 16px 16px',
        marginBottom: 0,
        flexShrink: 0,
      }}>
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
          alt="Firefighter gear inspection"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            display: 'block',
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.15) 0%, rgba(10,22,40,0.75) 100%)',
          borderRadius: '0 0 16px 16px',
        }} />
        {/* Text on top of overlay */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: 6,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            Gear Inspection
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: 0.3,
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            Scan manufacturer label to record gear data
          </div>
        </div>
      </div>

    <div className="screen">
      {/* Employee badge */}
      <div className="review-badge" style={{ marginTop: 12 }}>
        <span className="emp-id">👤 {employeeInfo.employeeId}</span>
        {employeeInfo.station && <span className="station">{employeeInfo.station}</span>}
      </div>

      {/* Gear type */}
      <div className="card">
        <div className="card-title">🧰 Select Gear Type</div>
        <div className="gear-grid">
          {GEAR_TYPES.map((item) => (
            <button
              key={item.id}
              className={`gear-btn ${value.gearType === item.id ? 'selected' : ''}`}
              onClick={() => onChange({ ...value, gearType: item.id })}
            >
              <span className="gear-icon">
                <GearTypeIcon item={item} size={28} />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div className="card">
        <div className="card-title">📸 Photograph the Label</div>
        <p style={{ fontSize: 14, color: '#4A5568', marginBottom: 12, lineHeight: 1.6, fontWeight: 500 }}>
          Take a clear, well-lit photo of the manufacturer's label sewn inside the gear. Claude will read it automatically.
        </p>

        {/* Image preview / drop zone */}
        <div className="image-zone" onClick={() => !value.photoDataUrl && photoInputRef.current?.click()}>
          {value.photoDataUrl ? (
            <img src={value.photoDataUrl} alt="Label preview" />
          ) : (
            <>
              <span className="upload-icon">📷</span>
              <span className="upload-text">Tap to take a photo</span>
              <span className="upload-sub">or use the buttons below</span>
            </>
          )}
        </div>

        {/* Hidden inputs */}
        <input
          ref={photoInputRef}
          type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <input
          ref={uploadInputRef}
          type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Action buttons */}
        <div className="photo-actions">
          <button className="btn btn-secondary" onClick={() => photoInputRef.current?.click()}>
            📷 Take Photo
          </button>
          <button className="btn btn-secondary" onClick={() => uploadInputRef.current?.click()}>
            🖼️ Upload
          </button>
          {value.photoDataUrl && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '11px' }}
              onClick={() => onChange({ ...value, photoBase64: '', photoDataUrl: '', mediaType: 'image/jpeg' })}
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div style={{ color: '#C41E3A', fontSize: 14, padding: '10px 14px', background: '#FFF0F3', border: '1px solid #FFBDCA', borderRadius: 8, marginBottom: 10, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={!canAnalyze}
          style={{ marginBottom: 0 }}
        >
          {analyzing ? (
            <><div className="spinner" /> Reading label with AI…</>
          ) : (
            'Analyze Label with Claude →'
          )}
        </button>
      </div>

      {/* Skip / back */}
      <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: 0 }}>
        ← Back
      </button>
    </div>
    </div>
  );
}
