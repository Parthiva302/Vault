import { createClient } from '@supabase/supabase-js';

const cleanEnv = (value: string | undefined) => value?.trim().replace(/^["']|["']$/g, '') ?? '';

const supabaseUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

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
  !supabaseAnonKey.includes('your_supabase_anon_key_here') &&
  !supabaseAnonKey.includes('YOUR_ANON_KEY');

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
