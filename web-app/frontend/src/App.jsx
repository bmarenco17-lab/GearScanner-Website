import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { seedDemoData } from './utils/demoData.js';

import LoginScreen      from './screens/LoginScreen.jsx';
import SignUpScreen     from './screens/SignUpScreen.jsx';
import AdminScreen      from './screens/AdminScreen.jsx';
import DashboardScreen  from './screens/DashboardScreen.jsx';
import EmployeeInfoStep from './screens/EmployeeInfoStep.jsx';
import GearScanStep     from './screens/GearScanStep.jsx';
import ReviewStep       from './screens/ReviewStep.jsx';
import SuccessStep      from './screens/SuccessStep.jsx';
import RecordsScreen    from './screens/RecordsScreen.jsx';
import ExportScreen     from './screens/ExportScreen.jsx';
import ChecklistScreen  from './screens/ChecklistScreen.jsx';
import SetPasswordScreen from './screens/SetPasswordScreen.jsx';

// ── localStorage key (used as cache for offline fallback) ────
const LS_KEY = 'gearscanner_records';

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function lsSave(records) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(records)); }
  catch { /* quota exceeded — ignore */ }
}

// ── Root — wraps everything in AuthProvider ───────────────────
export default function App() {
  // ── Invite / password-recovery links from Supabase ──────────
  // Users coming from a "set your password" email land on
  // /set-password with auth tokens in the URL hash. Handle that
  // route before anything else, independent of Firebase auth.
  const isSetPassword = typeof window !== 'undefined'
    && (window.location.pathname === '/set-password'
      || window.location.hash.includes('type=invite')
      || window.location.hash.includes('type=recovery'));

  if (isSetPassword) {
    return <SetPasswordScreen />;
  }

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

// ── Inner app — reads auth state ──────────────────────────────
function AppInner() {
  const { currentUser, userProfile, authLoading, isDemo, isAdmin, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // ── Loading splash ────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100dvh', background: '#0A1628', gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>🛡️</div>
        <div style={{ color: '#93C5FD', fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
          GearScanner
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Loading…</div>
      </div>
    );
  }

  // ── Not logged in → show auth screens ────────────────────
  if (!currentUser) {
    if (authView === 'signup') {
      return <SignUpScreen onBack={() => setAuthView('login')} />;
    }
    return <LoginScreen onSignUp={() => setAuthView('signup')} />;
  }

  // ── Logged in → show main app ─────────────────────────────
  return <MainApp userProfile={userProfile} isDemo={isDemo} isAdmin={isAdmin} logout={logout} />;
}

// ── Main App (authenticated) ──────────────────────────────────
function MainApp({ userProfile, isDemo, isAdmin, logout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanStep,  setScanStep]  = useState('employee');

  const [employeeInfo,  setEmployeeInfo]  = useState({ employeeId: '', name: '', station: '' });
  const [gearInfo,      setGearInfo]      = useState({ gearType: '', photoBase64: '', mediaType: 'image/jpeg', photoDataUrl: '' });
  const [extractedData, setExtractedData] = useState(null);

  // ── Records ───────────────────────────────────────────────
  const [records,  setRecords]  = useState(lsLoad);
  const [dbStatus, setDbStatus] = useState('connecting');

  // ── Firestore collection path for this user ───────────────
  const deptId = userProfile?.departmentId;

  // ── Seed demo data on first demo login ────────────────────
  useEffect(() => {
    if (isDemo && deptId) {
      seedDemoData(deptId).catch(console.error);
    }
  }, [isDemo, deptId]);

  // ── Real-time Firestore listener ──────────────────────────
  useEffect(() => {
    if (!deptId) return;

    const q = query(
      collection(db, 'users', deptId, 'gearRecords'),
      orderBy('timestamp', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setRecords(docs);
        lsSave(docs);
        setDbStatus('live');
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setDbStatus('offline');
      },
    );

    return unsub;
  }, [deptId]);

  // ── Add record ────────────────────────────────────────────
  const addRecord = useCallback(async (record) => {
    if (!deptId) return;
    const id = crypto.randomUUID();
    const { photoDataUrl, ...firestoreRecord } = record;

    const newRecord = {
      id,
      timestamp: new Date().toISOString(),
      ...firestoreRecord,
    };

    // Optimistic update
    setRecords(prev => {
      const next = [newRecord, ...prev];
      lsSave(next);
      return next;
    });

    // Write to Firestore
    try {
      await setDoc(doc(db, 'users', deptId, 'gearRecords', id), {
        ...newRecord,
        _savedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Firestore write failed:', err);
      setDbStatus('offline');
    }

    return id;
  }, [deptId]);

  // ── Delete record ─────────────────────────────────────────
  const deleteRecord = useCallback(async (id) => {
    if (!deptId) return;
    // Optimistic update
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      lsSave(next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'users', deptId, 'gearRecords', id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [deptId]);

  // ── Scan reset ────────────────────────────────────────────
  const resetScan = () => {
    setEmployeeInfo({ employeeId: '', name: '', station: '' });
    setGearInfo({ gearType: '', photoBase64: '', mediaType: 'image/jpeg', photoDataUrl: '' });
    setExtractedData(null);
    setScanStep('employee');
  };

  const STEPS = ['employee', 'gear', 'review', 'success'];

  // ── Admin tabs ────────────────────────────────────────────
  const tabs = isAdmin
    ? [
        { id: 'dashboard',  icon: '🛡️', label: 'Dashboard' },
        { id: 'admin',      icon: '⚙️', label: 'Admin'     },
        { id: 'records',    icon: '📋', label: 'Records'   },
        { id: 'checklist',  icon: '✅', label: 'Checklist' },
        { id: 'export',     icon: '📊', label: 'Export'    },
      ]
    : [
        { id: 'dashboard',  icon: '🛡️', label: 'Dashboard' },
        { id: 'scan',       icon: '📷', label: 'Scan'      },
        { id: 'records',    icon: '📋', label: 'Records'   },
        { id: 'checklist',  icon: '✅', label: 'Checklist' },
        { id: 'export',     icon: '📊', label: 'Export'    },
      ];

  return (
    <div className="app">
      {/* ── Demo mode banner ── */}
      {isDemo && (
        <div className="demo-banner">
          ⚡ DEMO MODE — Data resets every 24 hours
        </div>
      )}

      {/* ── Header ── */}
      <header className="app-header">
        <span style={{ fontSize: 30, lineHeight: 1 }}>🛡️</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="subtitle">
            {userProfile?.departmentName || 'Fire Department Gear Management'}
          </div>
          <h1>GearScanner</h1>
        </div>

        {/* DB status + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            padding: '3px 10px', borderRadius: 20,
            background: dbStatus === 'live'    ? 'rgba(26,138,74,0.25)'
                      : dbStatus === 'offline' ? 'rgba(196,30,58,0.25)'
                      : 'rgba(46,134,222,0.2)',
            color:      dbStatus === 'live'    ? '#6EE7A0'
                      : dbStatus === 'offline' ? '#FCA5A5'
                      : '#93C5FD',
            border: `1px solid ${
                        dbStatus === 'live'    ? 'rgba(26,138,74,0.4)'
                      : dbStatus === 'offline' ? 'rgba(196,30,58,0.4)'
                      : 'rgba(46,134,222,0.3)'}`,
          }}>
            {dbStatus === 'live' ? '● Cloud' : dbStatus === 'offline' ? '● Offline' : '○ Syncing'}
          </div>

          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 11, fontWeight: 700,
              padding: '4px 10px', cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="app-body">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            records={records}
            onNavigateScan={() => { setActiveTab('scan'); resetScan(); }}
          />
        )}

        {activeTab === 'admin' && <AdminScreen />}

        {activeTab === 'scan' && (
          <>
            {scanStep !== 'success' && (
              <div className="step-indicator">
                {STEPS.filter(s => s !== 'success').map((s, i) => {
                  const currentIdx = STEPS.indexOf(scanStep);
                  return (
                    <div
                      key={s}
                      className={`step-dot ${s === scanStep ? 'active' : i < currentIdx ? 'done' : ''}`}
                    />
                  );
                })}
              </div>
            )}

            {scanStep === 'employee' && (
              <EmployeeInfoStep
                value={employeeInfo}
                onChange={setEmployeeInfo}
                onNext={() => setScanStep('gear')}
              />
            )}
            {scanStep === 'gear' && (
              <GearScanStep
                value={gearInfo}
                onChange={setGearInfo}
                employeeInfo={employeeInfo}
                onNext={(data) => { setExtractedData(data); setScanStep('review'); }}
                onBack={() => setScanStep('employee')}
              />
            )}
            {scanStep === 'review' && (
              <ReviewStep
                employeeInfo={employeeInfo}
                gearInfo={gearInfo}
                extractedData={extractedData}
                records={records}
                onSave={(finalData) => {
                  addRecord({ ...employeeInfo, ...finalData });
                  setScanStep('success');
                }}
                onBack={() => setScanStep('gear')}
              />
            )}
            {scanStep === 'success' && (
              <SuccessStep
                onScanAnother={() => resetScan()}
                onViewRecords={() => { setActiveTab('records'); resetScan(); }}
              />
            )}
          </>
        )}

        {activeTab === 'records'   && <RecordsScreen records={records} deleteRecord={deleteRecord} />}
        {activeTab === 'checklist' && <ChecklistScreen />}
        {activeTab === 'export'    && <ExportScreen  records={records} />}
      </main>

      {/* ── Tab bar ── */}
      <nav className="tab-bar">
        {tabs.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="tab-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
