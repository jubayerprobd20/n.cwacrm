export function getSupabaseUrl(): string {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[^\x20-\x7E]/g, '');
  if (rawUrl && rawUrl.startsWith('http')) {
    return rawUrl;
  }
  return 'https://placeholder.supabase.co';
}

export function getSupabaseAnonKey(): string {
  const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[^\x20-\x7E]/g, '');
  if (rawKey) {
    return rawKey;
  }
  return 'placeholder-anon-key';
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
  return 'placeholder-service-role-key';
}
