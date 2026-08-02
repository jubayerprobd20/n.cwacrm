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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface WASenderConfigPanelProps {
  initialBaseUrl: string;
  initialApiKey: string;
  initialDeviceId: string;
  initialStatus: string;
  onConfigSaved: () => void;
}

export function WASenderConfigPanel({
  initialBaseUrl,
  initialApiKey,
  initialDeviceId,
  initialStatus,
  onConfigSaved,
}: WASenderConfigPanelProps) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl || 'https://www.wasenderapi.com/api');
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [deviceId, setDeviceId] = useState(initialDeviceId || '');
  const [status, setStatus] = useState(initialStatus || 'disconnected');
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleSaveAndVerify = async () => {
    if (!baseUrl || !apiKey) {
      toast.error('Please enter Base URL and API Key');
      return;
    }

    setConnecting(true);
    setQrCode(null);

    try {
      const res = await fetch('/api/whatsapp/wasender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim(),
          deviceId: deviceId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to verify WASender API connection');
        setConnecting(false);
        return;
      }

      setStatus(data.status || (data.connected ? 'connected' : 'disconnected'));
      if (data.qrcode) {
        setQrCode(data.qrcode);
        toast.success('Please scan the QR code to connect your session');
      } else if (data.connected) {
        toast.success('WASender API session connected successfully!');
      } else {
        toast.success('WASender API configuration saved!');
      }

      onConfigSaved();
    } catch (err) {
      toast.error('Network error connecting to WASender API server');
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/whatsapp/wasender', { method: 'GET' });
      const data = await res.json();

      if (data.qrcode) {
        setQrCode(data.qrcode);
        toast.success('QR Code updated');
      } else if (data.connected) {
        setStatus('connected');
        setQrCode(null);
        toast.success('WASender API session is connected!');
      } else {
        toast.error(data.message || 'Session not connected');
      }
    } catch (err) {
      toast.error('Failed to check WASender status');
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const isConnected = status === 'connected';

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <Alert className={`border ${isConnected ? 'bg-purple-950/20 border-purple-500/30' : 'bg-card border-border'}`}>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <CheckCircle2 className="size-5 text-purple-400" />
          ) : (
            <XCircle className="size-5 text-amber-400" />
          )}
          <div>
            <AlertTitle className="text-foreground font-semibold mb-0.5">
              {isConnected ? 'WASender API Session Connected' : 'WASender API Session Disconnected'}
            </AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              {isConnected
                ? 'Your WASender gateway session is active. Messages will be routed through your third-party connection.'
                : 'Enter your WASender API credentials and click Save & Verify.'}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* QR Code Scanner Display */}
      {qrCode && !isConnected && (
        <Card className="border-purple-500/30 bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="size-5 text-purple-400" />
              Scan QR Code with WhatsApp
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Open WhatsApp on your phone &rarr; Linked Devices &rarr; Link a Device &rarr; Scan QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-purple-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="WASender QR Code" className="size-64 object-contain" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckStatus}
              disabled={checking}
              className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
            >
              {checking ? <Loader2 className="size-4 animate-spin mr-1" /> : <RefreshCw className="size-4 mr-1" />}
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      )}

      {/* WASender Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Server className="size-5 text-purple-400" />
            WASender API Gateway Credentials
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your WASender API third-party gateway connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wa-url" className="text-foreground font-medium flex items-center gap-1.5">
              WASender Endpoint URL
            </Label>
            <Input
              id="wa-url"
              placeholder="https://www.wasenderapi.com/api"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              The API endpoint URL for your WASender service.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-apikey" className="text-foreground font-medium flex items-center gap-1.5">
              <Key className="size-3.5 text-muted-foreground" />
              API Key / Bearer Token
            </Label>
            <Input
              id="wa-apikey"
              type="password"
              placeholder="YOUR-WASENDER-API-KEY"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Your API key from the WASender dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-device" className="text-foreground font-medium flex items-center gap-1.5">
              <Smartphone className="size-3.5 text-muted-foreground" />
              Device ID (Optional)
            </Label>
            <Input
              id="wa-device"
              placeholder="device_123"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Required if your WASender account has multiple devices or sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button
              onClick={handleSaveAndVerify}
              disabled={connecting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {connecting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>Save & Verify Connection</>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleCheckStatus}
              disabled={checking || !baseUrl || !apiKey}
            >
              {checking ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>Check Session Status</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
