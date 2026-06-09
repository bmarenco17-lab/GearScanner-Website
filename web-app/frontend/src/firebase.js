import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyBWwQiGAK1Ogf37mYAJPSj0ZFv7Gnq17d8',
  authDomain:        'bmargearscanner.firebaseapp.com',
  projectId:         'bmargearscanner',
  storageBucket:     'bmargearscanner.firebasestorage.app',
  messagingSenderId: '627115724074',
  appId:             '1:627115724074:web:14e03f704a36058b16a253',
  measurementId:     'G-3CLRTWE8LF',
};

const app = initializeApp(firebaseConfig);

/** Firestore database instance */
export const db = getFirestore(app);

/** Firebase Auth instance */
export const auth = getAuth(app);
