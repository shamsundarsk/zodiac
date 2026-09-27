import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Is Supabase configured with valid environment variables?
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('http') && (supabaseAnonKey || supabaseServiceRoleKey)
);

// Public Anon Client for Client-Side subscriptions / reads
export const supabasePublic = (isSupabaseConfigured && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin Service-Role Client for Secure Server-Side Operations (Bypasses RLS safely in API Routes)
export const supabaseAdmin = (isSupabaseConfigured && (supabaseServiceRoleKey || supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;
