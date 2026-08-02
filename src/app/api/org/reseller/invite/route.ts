import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'

async function getMemberRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, organizationId: string) {
  const { data } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()
  return data?.role ?? null
}

/** POST /api/org/reseller/invite — body: { organizationId, email? } */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { organizationId, email } = body as { organizationId: string; email?: string }
  if (!organizationId) return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })

  const role = await getMemberRole(supabase, user.id, organizationId)
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!['owner', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin()
    .from('reseller_invites')
    .insert({
      reseller_org_id: organizationId,
      email: email ?? null,
    })
    .select('id, token, email, expires_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wacrm.nextcorebd.com'
  const inviteUrl = `${baseUrl}/join-reseller?token=${data.token}`

  return NextResponse.json({ invite: { ...data, url: inviteUrl } }, { status: 201 })
}

/** GET /api/org/reseller/invite?organizationId=xxx — list active invite links */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const url = new URL(request.url)
  const organizationId = url.searchParams.get('organizationId')
  if (!organizationId) return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })

  const role = await getMemberRole(supabase, user.id, organizationId)
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseAdmin()
    .from('reseller_invites')
    .select('id, token, email, expires_at, accepted_at, created_at')
    .eq('reseller_org_id', organizationId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wacrm.nextcorebd.com'
  const invites = (data ?? []).map(i => ({
    ...i,
    url: `${baseUrl}/join-reseller?token=${i.token}`,
  }))

  return NextResponse.json({ invites })
}
