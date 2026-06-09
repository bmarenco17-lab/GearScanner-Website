// ============================================================
//  GEAR SCANNER — API KEYS & CONFIGURATION
//  Replace the placeholder values below with your actual keys.
//  See SETUP_GUIDE.md for step-by-step instructions.
// ============================================================

// Anthropic Claude API Key
// Get yours at: https://console.anthropic.com
export const ANTHROPIC_API_KEY = 'sk-ant-YOUR_KEY_HERE';

// Claude model used for label vision analysis
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Firebase configuration
// Get from: Firebase Console → Project Settings → Your Apps → SDK setup
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firestore collection name for gear scan records
export const FIRESTORE_COLLECTION = 'gearScans';
