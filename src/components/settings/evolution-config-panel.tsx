'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  QrCode,
  RefreshCw,
  Server,
  Key,
  Smartphone,
  LogOut,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export interface EvolutionConfigPanelProps {
  initialBaseUrl: string;
  initialApiKey: string;
  initialInstanceName: string;
  initialStatus: string;
  onConfigSaved: () => void;
}

export function EvolutionConfigPanel({
  initialBaseUrl,
  initialApiKey,
  initialInstanceName,
  initialStatus,
  onConfigSaved,
}: EvolutionConfigPanelProps) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl || '');
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [instanceName, setInstanceName] = useState(initialInstanceName || 'wacrm-instance');
  const [useHostedServer, setUseHostedServer] = useState(!initialBaseUrl);
  const [status, setStatus] = useState(initialStatus || 'disconnected');
  const [connecting, setConnecting] = useState(false);
  const [fetchingQr, setFetchingQr] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [qrCode, setQrCode] = useState<{ base64?: string; code?: string; pairingCode?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const isConnected = status === 'open' || status === 'connected';

  // AUTO-POLLING: While QR code is shown and not connected, check live connection status every 3 seconds!
  useEffect(() => {
    if (!qrCode || isConnected) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/evolution', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.connected || data.status === 'open' || data.status === 'connected') {
            setStatus('open');
            setQrCode(null);
            toast.success('🎉 WhatsApp connected successfully! Ready to broadcast & receive messages.');
            onConfigSaved();
          } else if (data.qrcode) {
            setQrCode(data.qrcode);
          }
        }
      } catch {
        // ignore temporary network errors during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [qrCode, isConnected, onConfigSaved]);

  const handleConnect = async () => {
    if (!instanceName || (!useHostedServer && (!baseUrl || !apiKey))) {
      toast.error(useHostedServer ? 'Please enter an Instance Name' : 'Please enter Base URL, API Key, and Instance Name');
      return;
    }

    setConnecting(true);
    setQrCode(null);

    try {
      const res = await fetch('/api/whatsapp/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: useHostedServer ? '' : baseUrl.trim(),
          apiKey: useHostedServer ? '' : apiKey.trim(),
          instanceName: instanceName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to connect to Evolution API');
        setConnecting(false);
        return;
      }

      setStatus(data.status || (data.connected ? 'open' : 'connecting'));
      if (data.qrcode) {
        setQrCode(data.qrcode);
        toast.success('Instance created! Please scan the QR code below with WhatsApp');
      } else if (data.connected) {
        toast.success('Evolution API instance connected successfully!');
        onConfigSaved();
      } else {
        toast.success('Evolution API configuration saved!');
        onConfigSaved();
      }
    } catch (err) {
      toast.error('Network error connecting to Evolution API server');
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const handleFetchQr = async () => {
    setFetchingQr(true);
    try {
      const res = await fetch('/api/whatsapp/evolution', { method: 'GET' });
      const data = await res.json();

      if (data.qrcode) {
        setQrCode(data.qrcode);
        toast.success('QR Code updated');
      } else if (data.connected || data.status === 'open' || data.status === 'connected') {
        setStatus('open');
        setQrCode(null);
        toast.success('🎉 WhatsApp instance is connected and live!');
        onConfigSaved();
      } else {
        toast.error(data.message || 'Could not fetch QR code. Try clicking Save & Connect first.');
      }
    } catch (err) {
      toast.error('Failed to fetch live QR code');
      console.error(err);
    } finally {
      setFetchingQr(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/whatsapp/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          baseUrl,
          apiKey,
          instanceName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('disconnected');
        setQrCode(null);
        toast.success('Instance logged out and disconnected');
        onConfigSaved();
      } else {
        toast.error(data.error || 'Failed to logout instance');
      }
    } catch (err) {
      toast.error('Error logging out instance');
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  const pairingCodeValue =
    qrCode?.pairingCode || (qrCode?.code && qrCode.code.length <= 16 ? qrCode.code : null);

  const copyPairingCode = () => {
    if (pairingCodeValue) {
      navigator.clipboard.writeText(pairingCodeValue);
      setCopiedCode(true);
      toast.success('Pairing code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🟢 CONNECTED WHATSAPP CARD (Prominent display when account is connected) */}
      {isConnected ? (
        <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/20 shadow-lg shadow-emerald-500/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold shadow-sm">
                  <CheckCircle2 className="size-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider">
                      ● Live &amp; Connected
                    </Badge>
                    <Badge variant="outline" className="text-xs text-slate-300 border-white/20">
                      Evolution API
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-white mt-1">
                    WhatsApp Business Session Active
                  </CardTitle>
                  <p className="text-xs text-slate-300">
                    Instance: <strong className="text-emerald-300">{instanceName}</strong> • Outbound campaigns, auto-replies, and live inbox are 100% operational.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchQr}
                  disabled={fetchingQr}
                  className="border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 font-semibold"
                >
                  {fetchingQr ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <RefreshCw className="size-4 mr-1.5" />}
                  Test Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-500/20 font-semibold"
                >
                  {loggingOut ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <LogOut className="size-4 mr-1.5" />}
                  Disconnect
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : (
        /* 🔴 DISCONNECTED ALERT */
        <Alert className="border border-amber-500/40 bg-amber-500/10 text-amber-200">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0" />
              <div>
                <AlertTitle className="text-amber-200 font-bold mb-0.5">
                  WhatsApp Instance Disconnected — Messages Cannot Be Sent
                </AlertTitle>
                <AlertDescription className="text-amber-300/80 text-xs">
                  Click <strong>&quot;Generate QR Code &amp; Connect&quot;</strong> below and scan with your WhatsApp app. Our system auto-detects when you scan and connects instantly.
                </AlertDescription>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* QR Code Scanner Display (Shown below banner when generated) */}
      {qrCode && !isConnected && (
        <Card className="border-2 border-emerald-500/60 bg-gradient-to-b from-slate-950/95 to-slate-900/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <CardHeader className="text-center pb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse text-xs">
                ● Listening for WhatsApp Scan...
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="size-6 text-emerald-400" />
              Scan QR Code with WhatsApp
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm max-w-md mx-auto">
              Follow these simple steps on your phone to link your WhatsApp Business account:
            </CardDescription>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
              <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-white/10 font-medium">1. Open WhatsApp</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-white/10 font-medium">2. Tap Settings/Menu</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-white/10 font-medium">3. Linked Devices</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-500/30 font-medium">4. Link a Device &amp; Scan</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-5 pb-6">
            {qrCode.base64 ? (
              <div className="p-5 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode.base64} alt="Evolution QR Code" className="size-64 object-contain" />
              </div>
            ) : null}

            {pairingCodeValue ? (
              <div className="w-full max-w-sm space-y-1.5 text-center">
                <Label className="text-xs text-slate-400 font-medium">Or use WhatsApp Pairing Code:</Label>
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-white/10">
                  <span className="font-mono text-lg font-bold text-emerald-400 tracking-wider flex-1">
                    {pairingCodeValue}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyPairingCode} className="size-8">
                    {copiedCode ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-400" />}
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-emerald-300/90 text-center max-w-sm font-medium">
              ⚡ Auto-detecting scan... Keep this page open while you scan on your phone.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchQr}
                disabled={fetchingQr}
                className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
              >
                {fetchingQr ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <RefreshCw className="size-4 mr-1.5" />}
                Refresh QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution API Form */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Server className="size-5 text-emerald-500" />
                Evolution API Configuration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your WhatsApp instance connection settings
              </CardDescription>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/10 w-fit">
              <button
                type="button"
                onClick={() => setUseHostedServer(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  useHostedServer
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Hosted (Instant)
              </button>
              <button
                type="button"
                onClick={() => setUseHostedServer(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !useHostedServer
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🛠️ Custom Server
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {useHostedServer ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-400">⚡ Instant Server Configuration Enabled</p>
              <p className="text-slate-400">
                Your server URL and API Key are automatically provided by the system environment. Simply choose a name for your WhatsApp instance below and click <strong>Generate QR Code &amp; Connect</strong>.
              </p>
            </div>
          ) : null}

          {!useHostedServer ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="evo-url" className="text-foreground font-medium flex items-center gap-1.5">
                  Evolution Server Base URL
                </Label>
                <Input
                  id="evo-url"
                  placeholder="https://evo.yourdomain.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  The public address of your Evolution API server (without trailing slash).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evo-apikey" className="text-foreground font-medium flex items-center gap-1.5">
                  <Key className="size-3.5 text-muted-foreground" />
                  Global / Instance API Key
                </Label>
                <Input
                  id="evo-apikey"
                  type="password"
                  placeholder="YOUR-EVOLUTION-API-KEY"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your authentication key configured in your Evolution API environment.
                </p>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="evo-instance" className="text-foreground font-medium flex items-center gap-1.5">
              <Smartphone className="size-3.5 text-muted-foreground" />
              Instance Name
            </Label>
            <Input
              id="evo-instance"
              placeholder="wacrm-instance"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              A unique name for your WhatsApp connection (e.g. business-wa).
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {connecting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Connecting Instance...
                </>
              ) : (
                <>⚡ {isConnected ? 'Re-generate QR Code' : 'Generate QR Code & Connect'}</>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleFetchQr}
              disabled={fetchingQr || !instanceName || (!useHostedServer && (!baseUrl || !apiKey))}
            >
              {fetchingQr ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>Check Live Status</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
