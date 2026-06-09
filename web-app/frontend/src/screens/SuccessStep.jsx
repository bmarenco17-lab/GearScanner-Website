import React from 'react';

export default function SuccessStep({ onScanAnother, onViewRecords }) {
  return (
    <div className="success-screen">
      <div className="success-icon">✅</div>
      <div className="success-title">Record Saved!</div>
      <div className="success-sub">
        The gear record has been saved successfully.<br />
        What would you like to do next?
      </div>
      <button className="btn btn-primary" style={{ maxWidth: 340, width: '100%' }} onClick={onScanAnother}>
        📷 Scan Another Piece of Gear
      </button>
      <button className="btn btn-secondary" style={{ maxWidth: 340, width: '100%' }} onClick={onViewRecords}>
        📋 View All Records
      </button>
    </div>
  );
}
