'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, RefreshCw, Copy, CheckCircle2, Plus, ExternalLink,
  UserCircle2, Mail, Phone, Globe, Palette, Percent, Wallet,
  Send, Users, Ban, Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsPanelHead } from './settings-panel-head'
import { useAuth } from '@/hooks/use-auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResellerSettings {
  brand_name: string | null
  brand_logo_url: string | null
  accent_color: string
  support_email: string | null
  support_phone: string | null
  custom_domain: string | null
  manager_name: string | null
  manager_email: string | null
  credit_margin_pct: number
  wallet_balance: number
}

interface ResellerClient {
  id: string
  credit_balance: number
  status: 'active' | 'suspended'
  invited_at: string
  accepted_at: string | null
  client_org_id: string
  organizations: {
    id: string
    name: string
    slug: string
    plan: string
    subscription_status: string
  } | null
}

interface ResellerInvite {
  id: string
  token: string
  email: string | null
  expires_at: string
  url: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub?: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Branding Section ─────────────────────────────────────────────────────────

function BrandingSection({ settings, organizationId, onSave }: {
  settings: ResellerSettings
  organizationId: string
  onSave: (updates: Partial<ResellerSettings>) => Promise<void>
}) {
  const [form, setForm] = useState({
    brand_name: settings.brand_name ?? '',
    brand_logo_url: settings.brand_logo_url ?? '',
    accent_color: settings.accent_color ?? '#25D366',
    support_email: settings.support_email ?? '',
    support_phone: settings.support_phone ?? '',
    custom_domain: settings.custom_domain ?? '',
    credit_margin_pct: settings.credit_margin_pct ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({
      brand_name: form.brand_name || null,
      brand_logo_url: form.brand_logo_url || null,
      accent_color: form.accent_color,
      support_email: form.support_email || null,
      support_phone: form.support_phone || null,
      custom_domain: form.custom_domain || null,
      credit_margin_pct: Number(form.credit_margin_pct),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // organizationId needed to satisfy eslint — passed for future use
  void organizationId

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">White-Label Branding</h3>
          <p className="text-xs text-muted-foreground">Your clients will see these details instead of N.C WaCRM branding.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand_name">Brand name</Label>
            <Input id="brand_name" placeholder="e.g. Acme Communications"
              value={form.brand_name}
              onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand_logo_url">Logo URL</Label>
            <Input id="brand_logo_url" placeholder="https://..."
              value={form.brand_logo_url}
              onChange={e => setForm(f => ({ ...f, brand_logo_url: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accent_color">
              <span className="flex items-center gap-2"><Palette className="size-3.5" /> Accent colour</span>
            </Label>
            <div className="flex gap-2">
              <input type="color" value={form.accent_color}
                onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
                id="accent_color"
              />
              <Input value={form.accent_color}
                onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                placeholder="#25D366" className="font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custom_domain">
              <span className="flex items-center gap-2"><Globe className="size-3.5" /> Custom domain</span>
            </Label>
            <Input id="custom_domain" placeholder="crm.yourdomain.com"
              value={form.custom_domain}
              onChange={e => setForm(f => ({ ...f, custom_domain: e.target.value }))} />
            <p className="text-[11px] text-muted-foreground">Point a CNAME to <code className="font-mono">wacrm.nextcorebd.com</code></p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Support Contact</h3>
          <p className="text-xs text-muted-foreground">Shown to your clients inside the white-label portal.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="support_email"><span className="flex items-center gap-2"><Mail className="size-3.5" /> Support email</span></Label>
            <Input id="support_email" type="email" placeholder="support@yourdomain.com"
              value={form.support_email}
              onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support_phone"><span className="flex items-center gap-2"><Phone className="size-3.5" /> Support phone</span></Label>
            <Input id="support_phone" placeholder="+880 1712-345678"
              value={form.support_phone}
              onChange={e => setForm(f => ({ ...f, support_phone: e.target.value }))} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Credit Margin</h3>
          <p className="text-xs text-muted-foreground">The % markup you earn on every credit your clients consume.</p>
        </div>
        <div className="flex max-w-xs items-center gap-3">
          <div className="relative flex-1">
            <Input id="credit_margin_pct" type="number" min="0" max="100" step="0.5"
              value={form.credit_margin_pct}
              onChange={e => setForm(f => ({ ...f, credit_margin_pct: Number(e.target.value) }))} />
            <Percent className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">per credit</span>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} id="save-branding-btn">
          {saving ? 'Saving…' : 'Save branding'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-500">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Clients Section ──────────────────────────────────────────────────────────

function ClientsSection({ organizationId }: { organizationId: string }) {
  const [clients, setClients] = useState<ResellerClient[]>([])
  const [invites, setInvites] = useState<ResellerInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newOrgId, setNewOrgId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [cRes, iRes] = await Promise.all([
      fetch(`/api/org/reseller/clients?organizationId=${organizationId}`),
      fetch(`/api/org/reseller/invite?organizationId=${organizationId}`),
    ])
    const [cData, iData] = await Promise.all([cRes.json(), iRes.json()])
    setClients(cData.clients ?? [])
    setInvites(iData.invites ?? [])
    setLoading(false)
  }, [organizationId])

  useEffect(() => { void load() }, [load])

  async function handleAddManual() {
    if (!newOrgId.trim()) return
    setAdding(true)
    const res = await fetch('/api/org/reseller/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, client_org_id: newOrgId.trim() }),
    })
    setAdding(false)
    if (res.ok) { setAddDialogOpen(false); setNewOrgId(''); void load() }
  }

  async function handleInvite() {
    setInviting(true)
    const res = await fetch('/api/org/reseller/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, email: inviteEmail.trim() || undefined }),
    })
    setInviting(false)
    if (res.ok) {
      const d = await res.json() as { invite: ResellerInvite }
      setInvites(prev => [d.invite, ...prev])
      setInviteEmail('')
      setInviteDialogOpen(false)
    }
  }

  function copyUrl(url: string, id: string) {
    void navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Users} label="Total clients" value={String(clients.length)} />
        <StatCard icon={CheckCircle2} label="Active" value={String(clients.filter(c => c.status === 'active').length)} />
        <StatCard icon={Link2} label="Pending invites" value={String(invites.length)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" id="create-invite-btn"
          onClick={() => setInviteDialogOpen(true)}>
          <Send className="size-4" /> Generate invite link
        </Button>
        <Button variant="outline" size="sm" id="add-client-btn"
          onClick={() => setAddDialogOpen(true)}>
          <Plus className="size-4" /> Link by Org ID
        </Button>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create invite link</DialogTitle>
            <DialogDescription>Share this link with your client. It expires in 7 days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="invite_email">Client email (optional)</Label>
            <Input id="invite_email" type="email" placeholder="client@example.com"
              value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? 'Generating…' : 'Generate link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add manual dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link client manually</DialogTitle>
            <DialogDescription>Enter the Org ID of an existing N.C WaCRM workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="client_org_id">Organization ID</Label>
            <Input id="client_org_id" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={newOrgId} onChange={e => setNewOrgId(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManual} disabled={adding}>
              {adding ? 'Linking…' : 'Link client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active invite links */}
      {invites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active invite links</h4>
          <div className="space-y-2">
            {invites.map(inv => (
              <div key={inv.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-muted-foreground">{inv.url}</p>
                  {inv.email && <p className="text-xs text-muted-foreground">→ {inv.email}</p>}
                  <p className="text-[11px] text-muted-foreground/60">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(inv.url, inv.id)}
                  className="shrink-0 rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                  title="Copy link"
                >
                  {copiedId === inv.id
                    ? <CheckCircle2 className="size-4 text-emerald-500" />
                    : <Copy className="size-4 text-muted-foreground" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" /> Loading clients…
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <Building2 className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No clients yet — generate an invite link or link by Org ID.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const org = client.organizations
                return (
                  <tr key={client.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{org?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{org?.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="capitalize">{org?.plan ?? '—'}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">
                      ৳{client.credit_balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        client.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600',
                      ].join(' ')}>
                        {client.status === 'active' ? <CheckCircle2 className="size-3" /> : <Ban className="size-3" />}
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {client.accepted_at
                        ? new Date(client.accepted_at).toLocaleDateString()
                        : 'Pending'}
                    </td>
                    <td className="px-4 py-3">
                      {org && (
                        <a href={`/dashboard?org=${org.id}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Open client dashboard">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Credits Section ──────────────────────────────────────────────────────────

function CreditsSection({ settings, organizationId }: { settings: ResellerSettings; organizationId: string }) {
  const [topupOpen, setTopupOpen] = useState(false)
  const [amount, setAmount] = useState('')

  async function handleTopup() {
    if (!amount) return
    const res = await fetch('/api/billing/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wallet_topup', amount: Number(amount), organizationId }),
    })
    if (res.ok) {
      const { order } = await res.json() as { order?: { id: string } }
      console.log('Razorpay order created:', order)
    }
    setTopupOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
        <p className="text-sm font-medium text-muted-foreground">Wallet balance</p>
        <p className="mt-1 text-4xl font-bold text-foreground">
          ৳{settings.wallet_balance.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Available to distribute to your clients</p>
        <Button className="mt-4" size="sm" onClick={() => setTopupOpen(true)} id="topup-wallet-btn">
          <Plus className="size-4" /> Top up wallet
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">How Reseller Credits Work</h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>Top up your reseller wallet.</li>
          <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>Allocate credits to each sub-client from your balance.</li>
          <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">3</span>Your margin ({settings.credit_margin_pct}%) is automatically deducted from platform cost.</li>
          <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">4</span>Monitor usage in real-time from the Clients tab.</li>
        </ol>
      </div>

      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top up reseller wallet</DialogTitle>
            <DialogDescription>Enter the amount (BDT) you want to add to your wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="topup_amount">Amount (৳)</Label>
            <Input id="topup_amount" type="number" min="100" step="100" placeholder="e.g. 5000"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopupOpen(false)}>Cancel</Button>
            <Button onClick={handleTopup}>Continue to payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Account Manager Section ──────────────────────────────────────────────────

function AccountManagerSection({ settings }: { settings: ResellerSettings }) {
  return (
    <div className="space-y-6">
      {settings.manager_name ? (
        <div className="flex items-start gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserCircle2 className="size-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Dedicated Account Manager</p>
            <p className="text-lg font-semibold text-foreground">{settings.manager_name}</p>
            {settings.manager_email && (
              <a href={`mailto:${settings.manager_email}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Mail className="size-3.5" /> {settings.manager_email}
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-12 text-center">
          <UserCircle2 className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">No account manager assigned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Contact support to get a dedicated account manager for your Reseller account.</p>
          </div>
          <a href="mailto:support@nextcorebd.com"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Mail className="size-4" /> Contact support
          </a>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Reseller Program Benefits</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            'White-label panel with your own domain and branding',
            'Earn credit margin on every message your clients send',
            'Priority technical support and onboarding assistance',
            'Co-marketing opportunities with the N.C WaCRM team',
            'Early access to new features before general release',
          ].map(b => (
            <li key={b} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResellerPanel() {
  const { accountId } = useAuth()
  const [settings, setSettings] = useState<ResellerSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountType, setAccountType] = useState<string>('user')

  useEffect(() => {
    if (!accountId) return
    Promise.all([
      fetch(`/api/org/reseller/settings?organizationId=${accountId}`).then(r => r.json()),
      fetch(`/api/org/account-type?organizationId=${accountId}`).then(r => r.json()),
    ]).then(([s, a]) => {
      setSettings(s as ResellerSettings)
      setAccountType((a as { account_type?: string }).account_type ?? 'user')
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [accountId])

  async function handleSave(updates: Partial<ResellerSettings>) {
    if (!accountId) return
    const res = await fetch('/api/org/reseller/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: accountId, ...updates }),
    })
    if (res.ok) {
      const updated = await res.json() as ResellerSettings
      setSettings(updated)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-8">
        <RefreshCw className="size-4 animate-spin" /> Loading reseller panel…
      </div>
    )
  }

  // Not a reseller — show upgrade prompt
  if (accountType !== 'reseller') {
    return (
      <>
        <SettingsPanelHead title="Reseller Program" description="Become a N.C WaCRM partner — white-label the platform for your clients." />
        <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <RefreshCw className="size-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <p className="text-lg font-semibold text-foreground">You are on a User Account</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Switch to a Reseller Account to access white-label branding, sub-client management, credit margins, and a dedicated account manager.
            </p>
          </div>
          <a
            href="/settings?tab=account_type"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Upgrade to Reseller →
          </a>
        </div>
      </>
    )
  }

  if (!settings || !accountId) return null

  return (
    <>
      <SettingsPanelHead
        title="Reseller Program"
        description="Manage your white-label branding, sub-clients, and credit wallet."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Wallet balance"
          value={`৳${settings.wallet_balance.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`}
          sub="Available credits" />
        <StatCard icon={Percent} label="Your margin"
          value={`${settings.credit_margin_pct}%`}
          sub="Per message credit" />
        <StatCard icon={Globe} label="Custom domain"
          value={settings.custom_domain ?? '—'}
          sub={settings.custom_domain ? 'Active' : 'Not configured'} />
      </div>

      <Tabs defaultValue="branding" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="branding" id="tab-branding"><Palette className="size-4" /> Branding</TabsTrigger>
          <TabsTrigger value="clients" id="tab-clients"><Users className="size-4" /> Clients</TabsTrigger>
          <TabsTrigger value="credits" id="tab-credits"><Wallet className="size-4" /> Credits</TabsTrigger>
          <TabsTrigger value="manager" id="tab-manager"><UserCircle2 className="size-4" /> Account Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingSection settings={settings} organizationId={accountId} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="clients">
          <ClientsSection organizationId={accountId} />
        </TabsContent>
        <TabsContent value="credits">
          <CreditsSection settings={settings} organizationId={accountId} />
        </TabsContent>
        <TabsContent value="manager">
          <AccountManagerSection settings={settings} />
        </TabsContent>
      </Tabs>
    </>
  )
}
