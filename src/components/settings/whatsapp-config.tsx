'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Zap,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SettingsPanelHead } from './settings-panel-head';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { WhatsAppConfig as WhatsAppConfigType } from '@/types';
import { WhatsAppConnectButton } from './whatsapp-connect-button';
import { EvolutionConfigPanel } from './evolution-config-panel';
import { WASenderConfigPanel } from './wasender-config-panel';

const MASKED_TOKEN = '••••••••••••••••';

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
type ResetReason = 'token_corrupted' | 'meta_api_error' | null;

export function WhatsAppConfig() {
  const t = useTranslations('Settings.whatsapp');
  const supabase = createClient();
  // After multi-user, whatsapp_config is one-row-per-account, not
  // one-row-per-user. We pull `accountId` straight off the auth
  // context and key every read off it — so a teammate who just
  // joined an account sees the inviter's saved config without
  // having to re-enter anything.
  const { user, accountId, loading: authLoading, profileLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [resetReason, setResetReason] = useState<ResetReason>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  // Guards against re-hydrating the form when the load effect below
  // re-runs for reasons unrelated to actually switching accounts —
  // e.g. Supabase's onAuthStateChange fires a token refresh (new
  // `user` object, profileLoading flips true/false) when the browser
  // tab regains focus. Without this, that churn calls fetchConfig()
  // again and overwrites whatever the user typed but hadn't saved yet.
  const loadedAccountIdRef = useRef<string | null>(null);

  interface WabaConnection {
    id: string;
    waba_id: string;
    phone_number_id: string;
    status: string;
    created_at: string;
  }

  const [wabaConnection, setWabaConnection] = useState<WabaConnection | null>(null);

  const fetchWabaConnection = useCallback(async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('waba_connections')
        .select('id, waba_id, phone_number_id, status, created_at')
        .eq('organization_id', orgId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load waba connection:', error);
      }
      setWabaConnection((data as WabaConnection) || null);
    } catch (err) {
      console.error('fetchWabaConnection error:', err);
    }
  }, [supabase]);

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [pin, setPin] = useState('');
  const [tokenEdited, setTokenEdited] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'meta' | 'evolution' | 'wasender'>('meta');

  // True once /register has succeeded on Meta's side (timestamp set
  // in the row). When false, the saved config is metadata-only and
  // Meta will silently drop every inbound event — that's the
  // multi-number bug that prompted this work.
  const isRegistered = Boolean(config?.registered_at);
  const lastRegistrationError = config?.last_registration_error ?? null;

  const [verifyingRegistration, setVerifyingRegistration] = useState(false);
  type RegistrationProbe = {
    live: boolean;
    checks: Record<string, boolean | null>;
    errors?: string[];
    last_registration_error?: string | null;
    registered_at?: string | null;
    subscribed_apps_at?: string | null;
  };
  const [registrationProbe, setRegistrationProbe] =
    useState<RegistrationProbe | null>(null);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/${
          selectedProvider === 'evolution'
            ? 'evolution-webhook'
            : selectedProvider === 'wasender'
            ? 'wasender-webhook'
            : 'webhook'
        }`
      : '';

  const fetchConfig = useCallback(async (acctId: string, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      // Load form values from Supabase (shows what's in DB).
      // Switched from `user_id` (which would only match the row's
      // original author) to `account_id` so every member of the
      // account sees the same saved configuration. UNIQUE(account_id)
      // on the table guarantees the .maybeSingle() return type
      // remains accurate.
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('account_id', acctId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load config row:', error);
      }

      if (data) {
        setConfig(data);
        setPhoneNumberId(data.phone_number_id || '');
        setWabaId(data.waba_id || '');
        setAccessToken(MASKED_TOKEN);
        setVerifyToken('');
        setPin('');
        setTokenEdited(false);
        setSelectedProvider((prev) => prev ?? (data.provider || 'meta'));
      } else {
        setConfig(null);
        setPhoneNumberId('');
        setWabaId('');
        setAccessToken('');
        setVerifyToken('');
        setPin('');
        setTokenEdited(false);
        setSelectedProvider((prev) => prev ?? 'meta');
      }
      // Clear any stale probe result when reloading the row.
      setRegistrationProbe(null);

      // Then verify health via the API (decrypts token + pings Meta)
      if (data) {
        try {
          const res = await fetch('/api/whatsapp/config', { method: 'GET' });
          const payload = await res.json();

          if (payload.connected) {
            setConnectionStatus('connected');
            setResetReason(null);
            setStatusMessage('');
          } else {
            setConnectionStatus('disconnected');
            setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
            setStatusMessage(payload.message || '');
          }
        } catch (err) {
          console.error('Health check failed:', err);
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
        setResetReason(null);
        setStatusMessage('');
      }
    } catch (err) {
      console.error('fetchConfig error:', err);
      toast.error('Failed to load WhatsApp configuration');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Need both the auth session (`!authLoading`) AND the profile
    // (`!profileLoading`, which carries `accountId`). Without the
    // second guard, the effect would fire with `accountId === null`
    // for the first render window and bail without ever retrying
    // once the profile arrives.
    if (authLoading || profileLoading) return;
    if (!user || !accountId) {
      loadedAccountIdRef.current = null;
      setLoading(false);
      return;
    }
    if (loadedAccountIdRef.current === accountId) return;
    loadedAccountIdRef.current = accountId;
    fetchConfig(accountId);
    fetchWabaConnection(accountId);
  }, [authLoading, profileLoading, user, accountId, fetchConfig, fetchWabaConnection]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSave() {
    if (!phoneNumberId.trim()) {
      toast.error('Phone Number ID is required');
      return;
    }
    if (!config && (!accessToken.trim() || !tokenEdited)) {
      toast.error('Access Token is required for initial setup');
      return;
    }

    try {
      setSaving(true);

      // Always POST through the API — it verifies with Meta and encrypts
      // the access_token server-side with ENCRYPTION_KEY. Skipping this
      // and writing direct to Supabase stores the token in plaintext,
      // which then fails decryption on every subsequent health check.
      const payload: Record<string, unknown> = {
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim() || null,
        verify_token: verifyToken.trim() || null,
        // Optional — only sent when the user filled it in. The server
        // requires it on first save or when changing numbers; for a
        // simple token rotation, leaving it blank skips re-register.
        pin: pin.trim() || null,
      };

      if (tokenEdited && accessToken !== MASKED_TOKEN && accessToken.trim()) {
        payload.access_token = accessToken.trim();
      } else if (config) {
        // Existing config — reuse stored encrypted token by decrypting on the
        // server. But our POST handler requires an access_token to verify
        // with Meta. If the user didn't change the token, we need to signal
        // that. Simplest: require token re-entry if they're updating.
        toast.error('Please re-enter the Access Token to save changes');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save configuration');
        setSaving(false);
        return;
      }

      // The route now returns a structured outcome:
      //   * registered=true   → number is live, events will flow
      //   * registered=false  → credentials saved but /register
      //                         failed; UI shows the specific error
      //                         and a retry path. registration_error
      //                         is human-readable from Meta.
      if (data.registered === false && data.registration_error) {
        toast.error(
          `Saved, but Meta couldn't register the number: ${data.registration_error}`,
          { duration: 12000 },
        );
      } else if (data.registration_skipped) {
        // Credentials saved + verified, but /register was skipped
        // because no PIN was supplied (e.g. a Meta test number).
        // Don't claim the number is "Live" — point at the
        // Registration status banner instead.
        toast.success(
          'Credentials saved and verified. Inbound registration was skipped (no PIN) — see Registration status below.',
          { duration: 10000 },
        );
        setPin('');
      } else {
        toast.success(
          data.phone_info?.verified_name
            ? `Live — ${data.phone_info.verified_name} can now receive events.`
            : 'WhatsApp connected. Events will start flowing within a minute.',
        );
        // Clear the PIN so subsequent saves don't accidentally
        // re-register (which would void the active subscription if
        // the PIN became stale).
        setPin('');
      }

      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'GET' });
      const payload = await res.json();

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
        toast.success(
          payload.phone_info?.verified_name
            ? `Connected to ${payload.phone_info.verified_name}`
            : 'API connection successful'
        );
      } else {
        setConnectionStatus('disconnected');
        setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
        setStatusMessage(payload.message || '');
        toast.error(payload.message || 'API connection failed');
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setConnectionStatus('disconnected');
      toast.error('Connection test failed. Check network and try again.');
    } finally {
      setTesting(false);
    }
  }

  async function handleVerifyRegistration() {
    setVerifyingRegistration(true);
    setRegistrationProbe(null);
    try {
      const res = await fetch('/api/whatsapp/config/verify-registration', {
        method: 'GET',
      });
      const data = (await res.json()) as RegistrationProbe;
      setRegistrationProbe(data);
      if (data.live) {
        toast.success('Number is fully wired — Meta is delivering events.');
      } else {
        toast.error(
          'Number is not fully registered. See the checks below for which step failed.',
          { duration: 8000 },
        );
      }
      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('verify-registration failed:', err);
      toast.error('Could not reach the verification endpoint.');
    } finally {
      setVerifyingRegistration(false);
    }
  }

  async function handleReset() {
    if (!confirm('This will delete the current WhatsApp config so you can re-enter it. Continue?')) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset configuration');
        return;
      }

      toast.success('Configuration cleared. You can now re-enter your credentials.');
      setConfig(null);
      setPhoneNumberId('');
      setWabaId('');
      setAccessToken('');
      setVerifyToken('');
      setTokenEdited(false);
      setConnectionStatus('disconnected');
      setResetReason(null);
      setStatusMessage('');
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Failed to reset configuration');
    } finally {
      setResetting(false);
    }
  }

  function handleCopyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  }

  if (loading) {
    return (
      <section className="animate-in fade-in-50 duration-200">
        <SettingsPanelHead
          title={t("title")}
          description={t("description")}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const showResetBanner = resetReason === 'token_corrupted';

  return (
    <section className="animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title={t("title")}
        description={t("description")}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Main config form */}
      <div className="space-y-6">
        {/* Corrupted-token reset banner */}
        {showResetBanner && (
          <Alert className="bg-amber-950/40 border-amber-600/40">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <AlertTitle className="text-amber-200 mb-1">
                  Stored token can&apos;t be decrypted
                </AlertTitle>
                <AlertDescription className="text-amber-100/80 text-sm">
                  {statusMessage}
                </AlertDescription>
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('resetting')}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" />
                      {t('resetConfig')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* WhatsApp Connection Method Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            WhatsApp Connection Method
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedProvider('meta')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedProvider === 'meta'
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                  : 'border-border bg-card/60 hover:bg-card/80 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-foreground">Meta Cloud API</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Official
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Official Meta WABA connection. Requires 24h template rules.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProvider('evolution')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedProvider === 'evolution'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                  : 'border-border bg-card/60 hover:bg-card/80 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-foreground">Evolution API</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Self-Hosted
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Baileys open-source server. No 24h limit, free-form messages & QR code scanning.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProvider('wasender')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedProvider === 'wasender'
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                  : 'border-border bg-card/60 hover:bg-card/80 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-foreground">WASender API</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Gateway
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Third-party SaaS session gateway. Send messages without Meta template restrictions.
              </p>
            </button>
          </div>
        </div>

        {selectedProvider === 'evolution' ? (
          <EvolutionConfigPanel
            initialBaseUrl={config?.evolution_base_url || ''}
            initialApiKey={config?.evolution_api_key || ''}
            initialInstanceName={config?.evolution_instance_name || ''}
            initialStatus={config?.evolution_instance_status || 'disconnected'}
            onConfigSaved={() => {
              if (accountId) fetchConfig(accountId, true);
            }}
          />
        ) : selectedProvider === 'wasender' ? (
          <WASenderConfigPanel
            initialBaseUrl={config?.wasender_base_url || ''}
            initialApiKey={config?.wasender_api_key || ''}
            initialDeviceId={config?.wasender_device_id || ''}
            initialStatus={config?.wasender_status || 'disconnected'}
            onConfigSaved={() => {
              if (accountId) fetchConfig(accountId, true);
            }}
          />
        ) : (
          <>
            {/* Connection Status */}
            <Alert className="bg-card border-border">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <XCircle className="size-4 text-red-500" />
            )}
            <AlertTitle className="text-foreground mb-0">
              {connectionStatus === 'connected' ? t('credentialsValid') : t('notConnected')}
            </AlertTitle>
          </div>
          <AlertDescription className="text-muted-foreground">
            {connectionStatus === 'connected'
              ? t('connectedDesc')
              : statusMessage ||
                t('notConnectedDesc')}
          </AlertDescription>
        </Alert>

        {/* Registration Status — the "is it actually live?" check.
            Credentials being valid is necessary but not sufficient;
            without a successful /register call the number won't
            receive inbound events. Surface this dimension separately
            so users don't trust a misleading green banner. */}
        {config && (
          <Alert
            className={
              isRegistered
                ? 'bg-emerald-950/30 border-emerald-700/50'
                : 'bg-amber-950/30 border-amber-700/50'
            }
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {isRegistered ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-400" />
                )}
                <AlertTitle
                  className={
                    'mb-0 ' + (isRegistered ? 'text-emerald-200' : 'text-amber-200')
                  }
                >
                  {isRegistered
                    ? 'Registered — Meta will deliver events to N.C WaCRM'
                    : 'Not registered — Meta will not deliver events'}
                </AlertTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyRegistration}
                disabled={verifyingRegistration}
                className="border-border bg-transparent text-foreground hover:bg-muted h-7"
              >
                {verifyingRegistration ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Zap className="size-3.5" />
                )}
                {t('verifyWithMeta')}
              </Button>
            </div>
            <AlertDescription className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {isRegistered ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('subscribedSince', {
                      date: config.registered_at
                        ? new Date(config.registered_at).toLocaleString()
                        : t('unknownDate'),
                    }),
                  }}
                />
              ) : lastRegistrationError ? (
                <>
                  {t('lastAttemptFailed')}
                  <span className="text-red-300">
                    &quot;{lastRegistrationError}&quot;
                  </span>
                  . {t('retryHint')}
                </>
              ) : (
                <>{t('noRegistrationHint')}</>
              )}
            </AlertDescription>

            {registrationProbe && (
              <div className="mt-3 rounded border border-border bg-card/60 px-3 py-2 space-y-1.5 text-[11px]">
                <p className="font-medium text-foreground">
                  {t('diagnosticLastRun')}
                  <span className={registrationProbe.live ? 'text-emerald-400' : 'text-amber-400'}>
                    {registrationProbe.live ? t('live') : t('notLive')}
                  </span>
                </p>
                <ul className="space-y-0.5 text-muted-foreground">
                  {Object.entries(registrationProbe.checks).map(([k, v]) => (
                    <li key={k} className="flex items-center gap-1.5">
                      {v === true ? (
                        <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                      ) : v === false ? (
                        <XCircle className="size-3 text-red-400 shrink-0" />
                      ) : (
                        <span className="size-3 rounded-full border border-border shrink-0" />
                      )}
                      <code className="text-muted-foreground">{k}</code>
                    </li>
                  ))}
                </ul>
                {(registrationProbe.errors ?? []).length > 0 && (
                  <ul className="pt-1 space-y-0.5 text-red-300">
                    {registrationProbe.errors?.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Alert>
        )}

        {/* WABA Connections (Embedded Signup) Status Card */}
        <Card className="relative overflow-hidden border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <div className="absolute top-0 right-0 p-4">
            {wabaConnection?.status === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
                Disconnected
              </span>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="size-5 text-indigo-400" />
              Meta Embedded Signup
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Connect your WhatsApp Business Account directly using the secure Meta OAuth flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wabaConnection ? (
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg bg-slate-950/40 border border-white/5 p-3">
                  <p className="text-xs font-medium text-slate-500 uppercase">WhatsApp Business Account (WABA ID)</p>
                  <p className="mt-1 font-mono text-white select-all">{wabaConnection.waba_id}</p>
                </div>
                <div className="rounded-lg bg-slate-950/40 border border-white/5 p-3">
                  <p className="text-xs font-medium text-slate-500 uppercase">Phone Number ID</p>
                  <p className="mt-1 font-mono text-white select-all">{wabaConnection.phone_number_id}</p>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <p className="text-xs text-slate-400">
                    Connected on {new Date(wabaConnection.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to disconnect your WhatsApp account?')) {
                        const { error } = await supabase
                          .from('waba_connections')
                          .delete()
                          .eq('id', wabaConnection.id);
                        if (error) {
                          toast.error('Failed to disconnect');
                        } else {
                          toast.success('Disconnected successfully');
                          if (accountId) fetchWabaConnection(accountId);
                        }
                      }
                    }}
                    className="border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs h-8"
                  >
                    Disconnect Account
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-slate-400 mb-4 max-w-sm">
                  No active connection found. Click the button below to sign in with Facebook and authorize your WhatsApp Business profile.
                </p>
                <WhatsAppConnectButton organizationId={accountId || ''} onSuccess={() => accountId && fetchWabaConnection(accountId)} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Credentials & Action Buttons (conditional on Embedded Signup status) */}
        {wabaConnection?.status === 'connected' ? (
          <Alert className="bg-amber-950/20 border-amber-800/40">
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-amber-200">Manual Credentials Configuration Disabled</AlertTitle>
              <AlertDescription className="text-slate-400 text-xs mt-1 leading-relaxed">
                A connection via Meta Embedded Signup is currently active. Manual credentials configuration is disabled to prevent webhook routing and message dispatch conflicts. Disconnect the Meta Embedded Signup connection first if you need to use manual credentials.
              </AlertDescription>
            </div>
          </Alert>
        ) : (
          <>
            {/* API Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">API Credentials</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your Meta WhatsApp Business API credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phone Number ID</Label>
                  <Input
                    placeholder="e.g. 100234567890123"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">WhatsApp Business Account ID</Label>
                  <Input
                    placeholder="e.g. 100234567890456"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Permanent Access Token</Label>
                  <div className="relative">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      placeholder="Enter your access token"
                      value={accessToken}
                      onChange={(e) => {
                        setAccessToken(e.target.value);
                        setTokenEdited(true);
                      }}
                      onFocus={() => {
                        if (accessToken === MASKED_TOKEN) {
                          setAccessToken('');
                          setTokenEdited(true);
                        }
                      }}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {config && !tokenEdited && (
                    <p className="text-xs text-muted-foreground">
                      Token is hidden for security. Re-enter it to update configuration.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Webhook Verify Token</Label>
                  <Input
                    placeholder="Create a custom verify token"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    A custom string you create. Must match the token you set in Meta webhook settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Two-step verification PIN
                    <span className="ml-1 text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit PIN from Meta WhatsApp Manager"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Needed only to wire <strong className="text-muted-foreground">inbound</strong> messages
                    for a <strong className="text-muted-foreground">production</strong> number. Set it in{' '}
                    <strong className="text-muted-foreground">
                      Meta Business Manager → WhatsApp Accounts → Phone
                      Numbers → Two-step verification
                    </strong>
                    , then paste it here so N.C WaCRM can subscribe the number —
                    otherwise Meta routes inbound events to whichever app
                    last claimed it (the symptom that hits second numbers
                    under a shared WABA).{' '}
                    <strong className="text-muted-foreground">Meta test numbers</strong> have no
                    PIN and are pre-registered — leave this blank for them.
                    Leaving it blank also keeps an existing registration
                    untouched.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || !config}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {testing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    Test API Connection
                  </>
                )}
              </Button>
              {config && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={resetting}
                  className="border-red-900 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" />
                      Reset Configuration
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
          </>
        )}

        {/* Webhook URL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{t('webhookTitle')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('webhookDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('webhookUrl')}</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="bg-muted border-border text-muted-foreground font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                  className="shrink-0 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base">{t('setupInstructions')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('setupInstructionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion>
              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                    {t('step1')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li dangerouslySetInnerHTML={{ __html: t('step1_1') }} />
                    <li>{t('step1_2')}</li>
                    <li>{t('step1_3')}</li>
                    <li>{t('step1_4')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                    {t('step2')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('step2_1')}</li>
                    <li>{t('step2_2')}</li>
                    <li>{t('step2_3')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                    {t('step3')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('step3_1')}</li>
                    <li dangerouslySetInnerHTML={{ __html: t('step3_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('step3_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('step3_4') }} />
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                    {t('step4')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('step4_1')}</li>
                    <li>{t('step4_2')}</li>
                    <li dangerouslySetInnerHTML={{ __html: t('step4_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('step4_4') }} />
                    <li>{t('step4_5')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-4 pt-4 border-t border-border">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                {t('metaDocs')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </section>
  );
}
