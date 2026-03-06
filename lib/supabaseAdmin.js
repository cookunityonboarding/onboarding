// load env vars from local file when running scripts
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// service role key from env; keep this secret and only use on server
// prefer SUPABASE_URL rather than the public variable
exports.supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);