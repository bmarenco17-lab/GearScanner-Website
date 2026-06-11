// ── Supabase admin client ────────────────────────────────────
// Uses the SERVICE ROLE key, which bypasses Row Level Security and
// can manage auth users (invite, create, delete, update).
//
// ⚠️  NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend or
//     commit it to git. It belongs only in this backend's .env.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn(
      '\n⚠️  @supabase/supabase-js is not installed. Run `npm install` in web-app/backend.\n'
    );
  }
} else {
  console.warn(
    '\n⚠️  Supabase admin client not configured.\n' +
    '   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web-app/backend/.env\n' +
    '   to enable account creation / invite emails.\n'
  );
}

module.exports = { supabaseAdmin };
