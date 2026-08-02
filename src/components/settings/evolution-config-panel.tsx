'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [qrCode, setQrCode] = useState<{ base64?: string; code?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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
        toast.success('Instance created! Please scan the QR code with WhatsApp');
      } else if (data.connected) {
        toast.success('Evolution API instance connected successfully!');
      } else {
        toast.success('Evolution API configuration saved!');
      }

      onConfigSaved();
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
      } else if (data.connected) {
        setStatus('open');
        setQrCode(null);
        toast.success('WhatsApp instance is already connected!');
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

  const copyPairingCode = () => {
    if (qrCode?.code) {
      navigator.clipboard.writeText(qrCode.code);
      setCopiedCode(true);
      toast.success('Pairing code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const isConnected = status === 'open' || status === 'connected';

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <Alert className={`border ${isConnected ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-card border-border'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="size-5 text-emerald-400" />
            ) : (
              <XCircle className="size-5 text-amber-400" />
            )}
            <div>
              <AlertTitle className="text-foreground font-semibold mb-0.5">
                {isConnected ? 'Evolution API Instance Connected (Open)' : 'Evolution API Instance Disconnected'}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-xs">
                {isConnected
                  ? 'Your self-hosted Baileys server is connected. Outbound and inbound messages will bypass 24h template limits.'
                  : 'Enter your Evolution API credentials below and click Save & Connect to generate a QR code.'}
              </AlertDescription>
            </div>
          </div>
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              {loggingOut ? <Loader2 className="size-4 animate-spin mr-1" /> : <LogOut className="size-4 mr-1" />}
              Disconnect
            </Button>
          )}
        </div>
      </Alert>

      {/* QR Code Scanner Display */}
      {qrCode && !isConnected && (
        <Card className="border-emerald-500/30 bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="size-5 text-emerald-400" />
              Scan QR Code with WhatsApp
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Open WhatsApp on your phone &rarr; Linked Devices &rarr; Link a Device &rarr; Scan QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2">
            {qrCode.base64 ? (
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode.base64} alt="Evolution QR Code" className="size-64 object-contain" />
              </div>
            ) : null}

            {qrCode.code ? (
              <div className="w-full max-w-sm space-y-1.5 text-center">
                <Label className="text-xs text-slate-400 font-medium">Or use WhatsApp Pairing Code:</Label>
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-white/10">
                  <span className="font-mono text-lg font-bold text-emerald-400 tracking-wider flex-1">
                    {qrCode.code}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyPairingCode} className="size-8">
                    {copiedCode ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-400" />}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchQr}
                disabled={fetchingQr}
                className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
              >
                {fetchingQr ? <Loader2 className="size-4 animate-spin mr-1" /> : <RefreshCw className="size-4 mr-1" />}
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
                <Server className="size-5 text-emerald-400" />
                Evolution API Connection
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Connect your WhatsApp instance using Hosted (Instant) or Custom Evolution API
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
                Your server URL and API Key are automatically provided by the system environment. Simply choose a name for your WhatsApp instance below and click <strong>Generate QR Code</strong>.
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
              ) : useHostedServer ? (
                <>Generate QR Code &amp; Connect</>
              ) : (
                <>Save &amp; Connect Instance</>
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
                <>Check Live QR Code</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
