import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
  );
}

/**
 * Supabase client for server-side use only.
 * Uses the service_role key to bypass Row Level Security (RLS).
 * DO NOT use this on the client side.
 */
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
