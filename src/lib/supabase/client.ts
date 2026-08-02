import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from './env-utils'

// Singleton instance — one client shared across the whole browser session.
// Creating multiple clients causes auth-lock contention ("Lock was released
// because another request stole it") and intermittent fetch failures.
let browserClient: SupabaseClient | undefined

export function createClient() {
  if (browserClient) return browserClient

  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[^\x20-\x7E]/g, '')
  const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[^\x20-\x7E]/g, '')

  const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : getSupabaseUrl()
  const supabaseKey = envKey || getSupabaseAnonKey()

  browserClient = createBrowserClient(
    supabaseUrl,
    supabaseKey
  )

  return browserClient
}
