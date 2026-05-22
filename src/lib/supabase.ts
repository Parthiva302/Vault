import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const hasValidUrl = (value: string | undefined) => {
  if (!value || value.includes('your_supabase_project_url_here')) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  hasValidUrl(supabaseUrl) &&
  !!supabaseAnonKey &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here');

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'http://127.0.0.1:54321',
  isSupabaseConfigured ? supabaseAnonKey : 'missing-anon-key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  },
);
