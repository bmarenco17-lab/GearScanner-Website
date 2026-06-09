import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function AdminScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null); // { uid, departmentName }
  const [deptRecords, setDeptRecords] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // ── Load all department profiles ──────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'userProfiles'));
        const depts = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
        // Annotate each with record count
        const withCounts = await Promise.all(
          depts.map(async (dept) => {
            try {
              const recSnap = await getDocs(collection(db, 'users', dept.uid, 'gearRecords'));
              return { ...dept, recordCount: recSnap.size };
            } catch {
              return { ...dept, recordCount: 0 };
            }
          })
        );
        setDepartments(withCounts.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName || '')));
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── View a department's records ───────────────────────────
  async function viewDept(dept) {
    setSelected(dept);
    setLoadingRecs(true);
    try {
      const q    = query(collection(db, 'users', dept.uid, 'gearRecords'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setDeptRecords(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch {
      setDeptRecords([]);
    } finally {
      setLoadingRecs(false);
    }
  }

  // ── Deactivate a department (soft delete) ─────────────────
  async function toggleActive(dept) {
    const newState = !dept.active;
    try {
      await updateDoc(doc(db, 'userProfiles', dept.uid), { active: newState });
      setDepartments(prev => prev.map(d => d.uid === dept.uid ? { ...d, active: newState } : d));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  // ── Detail view ───────────────────────────────────────────
  if (selected) {
    return (
      <div className="screen">
        <button
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() => { setSelected(null); setDeptRecords([]); }}
        >
          ← All Departments
        </button>

        <div className="card" style={{ borderLeft: '4px solid #2E86DE', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0A1628', marginBottom: 4 }}>
            {selected.departmentName || selected.email}
          </div>
          <div style={{ fontSize: 12, color: '#4A5568' }}>
            {selected.email} · {selected.stationName || '—'} · UID: {selected.uid.slice(0, 8)}…
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: selected.active !== false ? '#1A8A4A' : '#C41E3A', fontWeight: 700 }}>
            {selected.active !== false ? '● Active' : '● Deactivated'}
          </div>
        </div>

        {loadingRecs ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#4A5568' }}>Loading records…</div>
        ) : deptRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#4A5568' }}>No records found.</div>
        ) : (
          deptRecords.map(rec => (
            <div key={rec.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0A1628' }}>
                    {rec.name || '—'} · {(rec.gearType || '').toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>
                    {rec.manufacturer} {rec.model} · S/N: {rec.serialNumber || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9BA5B4', marginTop: 2 }}>
                    {rec.timestamp ? new Date(rec.timestamp).toLocaleDateString() : ''}
                  </div>
                </div>
                <div style={{
                  background: '#EBF4FF', color: '#1A6BBF',
                  padding: '4px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  textTransform: 'uppercase', flexShrink: 0,
                }}>
                  {rec.employeeId || '—'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ── Department list ───────────────────────────────────────
  return (
    <div className="screen">
      {/* Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)',
        color: '#fff', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93C5FD', marginBottom: 4, textTransform: 'uppercase' }}>
          Admin Panel
        </div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>All Departments</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
          {loading ? 'Loading…' : `${departments.length} department${departments.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4A5568' }}>Loading departments…</div>
      ) : departments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4A5568' }}>
          No departments found. Users will appear here after they sign up.
        </div>
      ) : (
        departments.map(dept => (
          <div key={dept.uid} className="card" style={{
            marginBottom: 10,
            borderLeft: `4px solid ${dept.active !== false ? '#2E86DE' : '#CBD5E0'}`,
            opacity: dept.active !== false ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0A1628' }}>
                  {dept.departmentName || dept.email}
                </div>
                <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>
                  {dept.email}
                  {dept.stationName ? ` · ${dept.stationName}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#9BA5B4', marginTop: 2 }}>
                  {dept.recordCount} record{dept.recordCount !== 1 ? 's' : ''}
                  {dept.createdAt?.toDate ? ` · Joined ${dept.createdAt.toDate().toLocaleDateString()}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => viewDept(dept)}
                  style={{
                    background: '#EBF4FF', color: '#1A6BBF',
                    border: 'none', borderRadius: 6,
                    padding: '6px 12px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
                <button
                  onClick={() => toggleActive(dept)}
                  style={{
                    background: dept.active !== false ? '#FFF0F3' : '#E6F5EC',
                    color:      dept.active !== false ? '#C41E3A' : '#1A8A4A',
                    border: 'none', borderRadius: 6,
                    padding: '6px 12px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {dept.active !== false ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#9BA5B4' }}>
        To delete accounts or reset passwords, use the{' '}
        <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: '#2E86DE' }}>
          Firebase Console
        </a>
      </div>
    </div>
  );
}
