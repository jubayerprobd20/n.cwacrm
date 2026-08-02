import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy, shared service-role client for automation engine work.
// Mirrors the pattern used by the webhook handler
// (src/app/api/whatsapp/webhook/route.ts).
let _adminClient: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[^\x20-\x7E]/g, '')
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/[^\x20-\x7E]/g, '')
    _adminClient = createClient(url, key)
  }
  return _adminClient
}
