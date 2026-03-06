import { createClient } from "@supabase/supabase-js";

// service role key from env; keep this secret and only use on server
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);