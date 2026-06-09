import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FIRESTORE_COLLECTION } from '../config/constants';

/**
 * Save a gear scan record to Firestore.
 * @param {Object} record - Gear data + employeeId + station
 * @returns {Promise<string>} New document ID
 */
export async function saveGearScan(record) {
  const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), {
    ...record,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Fetch all gear scan records, newest first.
 * @returns {Promise<Array>} Array of records with id field
 */
export async function getAllGearScans() {
  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp
      ? doc.data().timestamp.toDate().toISOString()
      : '',
  }));
}
