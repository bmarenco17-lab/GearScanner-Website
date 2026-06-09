import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// ── Known special accounts ────────────────────────────────────
export const DEMO_EMAIL  = 'demogearscanner@gmail.com';
export const ADMIN_EMAIL = 'admin@gearscanner.com';

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);

  // ── Auth actions ──────────────────────────────────────────
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  async function signup(email, password, departmentName, stationName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'userProfiles', cred.user.uid), {
      email,
      departmentName,
      stationName,
      role: 'department',
      createdAt: serverTimestamp(),
      active: true,
    });
    return cred;
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // ── Auth state listener ───────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setAuthLoading(false);
        return;
      }

      // Special roles by email
      if (user.email === ADMIN_EMAIL) {
        setUserProfile({
          uid: user.uid,
          email: user.email,
          role: 'admin',
          departmentName: 'GearScanner Admin',
          stationName: '',
          departmentId: user.uid,
        });
        setAuthLoading(false);
        return;
      }

      if (user.email === DEMO_EMAIL) {
        setUserProfile({
          uid: user.uid,
          email: user.email,
          role: 'demo',
          departmentName: 'Riverside Fire Department',
          stationName: 'Station 1, 2 & 3',
          departmentId: user.uid,
        });
        setAuthLoading(false);
        return;
      }

      // Regular department: load Firestore profile
      try {
        const snap = await getDoc(doc(db, 'userProfiles', user.uid));
        if (snap.exists()) {
          setUserProfile({
            uid: user.uid,
            email: user.email,
            departmentId: user.uid,
            role: 'department',
            ...snap.data(),
          });
        } else {
          // Fallback if profile doc missing
          setUserProfile({
            uid: user.uid,
            email: user.email,
            role: 'department',
            departmentName: user.email.split('@')[0],
            stationName: '',
            departmentId: user.uid,
          });
        }
      } catch {
        setUserProfile({
          uid: user.uid,
          email: user.email,
          role: 'department',
          departmentName: user.email.split('@')[0],
          stationName: '',
          departmentId: user.uid,
        });
      }

      setAuthLoading(false);
    });

    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    authLoading,
    isDemo:  userProfile?.role === 'demo',
    isAdmin: userProfile?.role === 'admin',
    login,
    logout,
    signup,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
