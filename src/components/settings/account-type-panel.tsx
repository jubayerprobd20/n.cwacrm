'use client'

import { useState, useEffect } from 'react'
import { Building2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SettingsPanelHead } from './settings-panel-head'
import { useAuth } from '@/hooks/use-auth'

type AccountType = 'user' | 'reseller'

interface AccountTypeTileProps {
  type: AccountType
  selected: boolean
  onSelect: (t: AccountType) => void
}

function AccountTypeTile({ type, selected, onSelect }: AccountTypeTileProps) {
  const isUser = type === 'user'
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={[
        'relative flex flex-col gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/40',
      ].join(' ')}
    >
      {selected && (
        <CheckCircle2 className="absolute top-4 right-4 size-5 text-primary" />
      )}

      <div className={[
        'flex size-12 items-center justify-center rounded-xl',
        selected ? 'bg-primary/10' : 'bg-muted',
      ].join(' ')}>
        {isUser
          ? <Building2 className={`size-6 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
          : <RefreshCw className={`size-6 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        }
      </div>

      <div>
        <p className="text-base font-semibold text-foreground">
          {isUser ? 'User Account' : 'Reseller Account'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isUser
            ? 'For businesses using WhatsApp API, SMS, IVR for their own customer engagement.'
            : 'For agencies and partners reselling WhatsApp credits & CRM under their own brand.'
          }
        </p>
      </div>

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {isUser ? (
          <>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />OTP, order updates & appointment reminders</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Automated support bots</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Bulk broadcast messaging</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Lead nurturing workflows</li>
          </>
        ) : (
          <>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />White-label panel with your branding</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Margin on SMS / WhatsApp credits</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Manage multiple client sub-accounts</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary/60 shrink-0" />Dedicated account manager support</li>
          </>
        )}
      </ul>

      <div className={[
        'self-start rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase',
        isUser
          ? 'bg-blue-500/10 text-blue-500'
          : 'bg-emerald-500/10 text-emerald-500',
      ].join(' ')}>
        {isUser ? 'Standard' : 'Partner Program'}
      </div>
    </button>
  )
}

export function AccountTypePanel() {
  const { accountId } = useAuth()
  const [current, setCurrent] = useState<AccountType>('user')
  const [selected, setSelected] = useState<AccountType>('user')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!accountId) return
    fetch(`/api/org/account-type?organizationId=${accountId}`)
      .then(r => r.json())
      .then(d => {
        const t = (d.account_type ?? 'user') as AccountType
        setCurrent(t)
        setSelected(t)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [accountId])

  const isDirty = selected !== current

  function handleSave() {
    if (selected === 'reseller' && current === 'user') {
      setConfirmOpen(true)
      return
    }
    void doSave()
  }

  async function doSave() {
    if (!accountId) return
    setSaving(true)
    try {
      const res = await fetch('/api/org/account-type', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: accountId, account_type: selected }),
      })
      if (!res.ok) throw new Error(await res.text())
      setCurrent(selected)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SettingsPanelHead
        title="Account Type"
        description="Choose how you use N.C WaCRM — as a direct business or as an agency reselling services to clients."
      />

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AccountTypeTile type="user" selected={selected === 'user'} onSelect={setSelected} />
            <AccountTypeTile type="reseller" selected={selected === 'reseller'} onSelect={setSelected} />
          </div>

          {current === 'reseller' && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Your account is on the <strong>Reseller Program</strong>. Configure your white-label branding and manage sub-clients in the <strong>Reseller</strong> section.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!isDirty || saving}
              id="save-account-type-btn"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                <CheckCircle2 className="size-4" /> Saved
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upgrade confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Switch to Reseller Account?
            </DialogTitle>
            <DialogDescription>
              Upgrading to a <strong>Reseller Account</strong> unlocks the Partner Program — white-label branding, sub-client management, and credit margins.
              This change may affect your billing plan. Contact support to revert if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => { setConfirmOpen(false); void doSave() }}
            >
              Upgrade to Reseller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
