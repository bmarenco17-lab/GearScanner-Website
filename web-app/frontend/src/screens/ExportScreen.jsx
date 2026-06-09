import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { calcRetirementDate, retirementDays, retirementStatusLabel, fmtDate } from '../utils/retirement.js';

const EXPORT_COLS = [
  { key: 'id',               header: 'Record ID'           },
  { key: 'employeeId',       header: 'Employee ID'         },
  { key: 'name',             header: 'Firefighter Name'    },
  { key: 'station',          header: 'Station'             },
  { key: 'timestamp',        header: 'Timestamp'           },
  { key: 'manufacturer',     header: 'Manufacturer'        },
  { key: 'model',            header: 'Model / Style #'     },
  { key: 'gearType',         header: 'Gear Type'           },
  { key: 'measureChest',     header: 'Chest'               },
  { key: 'measureFront',     header: 'Front'               },
  { key: 'measureBack',      header: 'Back'                },
  { key: 'measureSleeve',    header: 'Sleeve'              },
  { key: 'measureInseam',    header: 'Inseam'              },
  { key: 'measureWaist',     header: 'Waist'               },
  { key: 'measureHelmet',    header: 'Hat / Helmet Size'   },
  { key: 'measureGloves',    header: 'Glove Size'          },
  { key: 'measureBoots',     header: 'Boot Size'           },
  { key: 'nfpaStandard',     header: 'NFPA Standard'       },
  { key: 'complianceInfo',   header: 'Compliance Info'     },
  { key: 'manufactureDate',  header: 'Manufacture Date'    },
  { key: 'retirementDate',   header: 'Retirement Date'     },
  { key: 'retirementStatus', header: 'Retirement Status'   },
  { key: 'expirationDate',   header: 'Expiration Date'     },
  { key: 'serialNumber',     header: 'Serial / Lot #'      },
  { key: 'inspectionInfo',   header: 'Inspection / ISP'    },
];

export default function ExportScreen({ records }) {
  const [exported, setExported] = useState(false);

  const uniqueStations  = new Set(records.map((r) => r.station).filter(Boolean)).size;
  const uniqueEmployees = new Set(records.map((r) => r.employeeId).filter(Boolean)).size;

  const exportToExcel = () => {
    if (records.length === 0) return;

    const rows = records.map((rec) => {
      const row = {};
      EXPORT_COLS.forEach(({ key, header }) => {
        if (key === 'retirementDate') {
          const d = calcRetirementDate(rec.manufactureDate);
          row[header] = d ? fmtDate(d) : '';
        } else if (key === 'retirementStatus') {
          const days = retirementDays(rec.manufactureDate);
          row[header] = days !== null ? retirementStatusLabel(days) : '';
        } else {
          // Coerce null / undefined / literal "undefined" to empty string
          const val = rec[key];
          row[header] = (val === null || val === undefined || val === 'undefined' || val === 'null')
            ? ''
            : String(val).trim();
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = EXPORT_COLS.map(({ header }) => ({ wch: Math.max(header.length + 2, 16) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gear Scans');

    const filename = `gear_scans_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="screen" style={{ paddingTop: 20 }}>
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num">{records.length}</div>
          <div className="stat-lbl">Scans</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{uniqueEmployees}</div>
          <div className="stat-lbl">Firefighters</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{uniqueStations}</div>
          <div className="stat-lbl">Stations</div>
        </div>
      </div>

      {/* Export button */}
      <div className="card" style={{ borderLeft: '4px solid #2E86DE' }}>
        <div className="card-title">📊 Export to Excel</div>
        <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.6, marginBottom: 18, fontWeight: 500 }}>
          Downloads all {records.length} gear scan record{records.length !== 1 ? 's' : ''} as
          a <strong>.xlsx</strong> file. Opens directly in Microsoft Excel, Google Sheets, or Numbers.
        </p>

        <button
          className="btn btn-green"
          onClick={exportToExcel}
          disabled={records.length === 0}
          style={{ marginBottom: 0 }}
        >
          {exported ? '✅ Downloaded!' : `📥 Download gear_scans.xlsx (${records.length} rows)`}
        </button>

        {records.length === 0 && (
          <p style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            No records to export yet.
          </p>
        )}
      </div>

      {/* Column list */}
      <div className="card">
        <div className="card-title">📋 Columns in Export</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EXPORT_COLS.map(({ header }) => (
            <span
              key={header}
              style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 4, padding: '4px 10px',
                fontSize: 12, color: '#4A5568', fontWeight: 600,
              }}
            >
              {header}
            </span>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{
        background: '#EBF4FF', border: '1px solid #C5DCF5',
        borderLeft: '4px solid #2E86DE',
        borderRadius: 8, padding: '14px 16px',
        fontSize: 14, color: '#1E3A5F', lineHeight: 1.6, fontWeight: 500,
      }}>
        💡 <strong>Note:</strong> Records are stored in your browser's local storage.
        Export regularly to preserve your data. Clearing browser data will erase records.
      </div>
    </div>
  );
}
