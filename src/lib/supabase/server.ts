import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey } from './env-utils'

export async function createClient() {
  const cookieStore = await cookies()

  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[^\x20-\x7E]/g, '')
  const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[^\x20-\x7E]/g, '')

  const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : getSupabaseUrl()
  const supabaseKey = envKey || getSupabaseAnonKey()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
