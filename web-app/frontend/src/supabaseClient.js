import { createClient } from '@supabase/supabase-js';

// ── Supabase project config ──────────────────────────────────
// The anon key is safe to expose in frontend code (it's restricted
// by Row Level Security on the Supabase project). Set it in
// web-app/frontend/.env as VITE_SUPABASE_ANON_KEY.
const SUPABASE_URL = 'https://vgjfkjahzirrlgdlegbn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.warn(
    'VITE_SUPABASE_ANON_KEY is not set. Add it to web-app/frontend/.env ' +
    '(see .env.example). Get it from Supabase -> Settings -> API Keys.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Lets supabase-js pick up the access/refresh tokens from the
    // invite/recovery email link (URL hash) automatically.
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
