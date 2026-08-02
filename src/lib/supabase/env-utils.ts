const DEFAULT_SUPABASE_URL = 'https://supabase.nextcorebd.com';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODU2NDg3ODYsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.iSZg0CWW5Vb13LfFvmP5OqlYls6rFUqVvyOYZ9NAjG0';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODU2NDg3ODYsImV4cCI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.9e63aTxudy_J6LIPyz8cbei3mHEiRcrViOcFouQwScw';

export function getSupabaseUrl(): string {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[^\x20-\x7E]/g, '');
  if (rawUrl && rawUrl.startsWith('http')) {
    return rawUrl;
  }
  return DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[^\x20-\x7E]/g, '');
  if (rawKey) {
    return rawKey;
  }
  return DEFAULT_ANON_KEY;
}

export function getSupabaseServiceRoleKey(): string {
  const rawKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  )
    .trim()
    .replace(/[^\x20-\x7E]/g, '');
  if (rawKey) {
    return rawKey;
  }
  return DEFAULT_SERVICE_ROLE_KEY;
}
