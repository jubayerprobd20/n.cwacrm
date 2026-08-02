'use client';

import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  BookOpen,
  Share2,
  AtSign,
  Users,
  Volume2,
  CheckCircle2,
  XCircle,
  Link2,
  Settings,
  Copy,
  Check,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { SettingsPanelHead } from './settings-panel-head';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Custom inline SVG icons for social platforms
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Configuration states types
interface SheetsConfig {
  connected: boolean;
  url: string;
  sheetName: string;
  syncContacts: boolean;
  syncMessages: boolean;
}

interface NotionConfig {
  connected: boolean;
  token: string;
  databaseId: string;
}

interface WebhookConfig {
  connected: boolean;
  url: string;
  events: string[];
}

interface MetaChannelConfig {
  connected: boolean;
  name: string;
}

interface GroupConfig {
  connected: boolean;
  monitorAll: boolean;
  groupsList: string[];
}

export function IntegrationsPanel() {
  const supabase = createClient();
  const { accountId, canEditSettings } = useAuth();

  // Modal toggle states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Connection configurations state (stubs)
  const [sheets, setSheets] = useState<SheetsConfig>({
    connected: false,
    url: '',
    sheetName: 'N.C WaCRM Leads',
    syncContacts: true,
    syncMessages: false,
  });

  const [notion, setNotion] = useState<NotionConfig>({
    connected: false,
    token: '',
    databaseId: '',
  });

  const [n8n, setN8n] = useState<WebhookConfig>({
    connected: false,
    url: '',
    events: ['message.received', 'contact.created'],
  });

  const [make, setMake] = useState<WebhookConfig>({
    connected: false,
    url: '',
    events: ['message.received'],
  });

  const [facebook, setFacebook] = useState<MetaChannelConfig>({
    connected: false,
    name: '',
  });

  const [instagram, setInstagram] = useState<MetaChannelConfig>({
    connected: false,
    name: '',
  });

  const [threads, setThreads] = useState<MetaChannelConfig>({
    connected: false,
    name: '',
  });

  const [groups, setGroups] = useState<GroupConfig>({
    connected: false,
    monitorAll: true,
    groupsList: ['Sales Leads IN', 'Support Group EU'],
  });

  const [channels, setChannels] = useState<MetaChannelConfig>({
    connected: false,
    name: '',
  });

  // Shopify Configuration State
  const [shopifyShopUrl, setShopifyShopUrl] = useState('');
  const [shopifyAccessToken, setShopifyAccessToken] = useState('');
  const [shopifyCartEnabled, setShopifyCartEnabled] = useState(false);
  const [shopifyCartMsg, setShopifyCartMsg] = useState(
    'Hi {{name}}, we noticed you left items in your cart. Complete your purchase here: {{checkout_url}}'
  );
  const [shopifyTrackingEnabled, setShopifyTrackingEnabled] = useState(false);
  const [shopifyTrackingMsg, setShopifyTrackingMsg] = useState(
    'Hi {{name}}, your order has been shipped! Tracking number: {{tracking_number}}'
  );

  // WooCommerce Configuration State
  const [wooStoreUrl, setWooStoreUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');
  const [wooCartEnabled, setWooCartEnabled] = useState(false);
  const [wooCartMsg, setWooCartMsg] = useState(
    'Hi {{name}}, we noticed you left items in your cart. Complete your purchase here: {{checkout_url}}'
  );
  const [wooTrackingEnabled, setWooTrackingEnabled] = useState(false);
  const [wooTrackingMsg, setWooTrackingMsg] = useState(
    'Hi {{name}}, your order has been shipped! Tracking number: {{tracking_number}}'
  );

  // Razorpay Configuration State
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');

  // UPI Configuration State
  const [upiVpa, setUpiVpa] = useState('');
  const [upiName, setUpiName] = useState('');

  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-crm-domain.com';

  useEffect(() => {
    if (!accountId) return;
    fetchIntegrations();
  }, [accountId]);

  async function fetchIntegrations() {
    try {
      setLoading(true);
      // Fetch Shopify/WooCommerce
      const { data: eco } = await supabase
        .from('ecommerce_integrations')
        .select('*')
        .eq('organization_id', accountId)
        .maybeSingle();

      if (eco) {
        setShopifyShopUrl(eco.shopify_shop_url || '');
        setShopifyAccessToken(eco.shopify_access_token ? '••••••••••••' : '');
        setShopifyCartEnabled(eco.abandoned_cart_enabled);
        setShopifyCartMsg(eco.abandoned_cart_message || '');
        setShopifyTrackingEnabled(eco.tracking_alerts_enabled);
        setShopifyTrackingMsg(eco.tracking_message || '');

        setWooStoreUrl(eco.woocommerce_store_url || '');
        setWooConsumerKey(eco.woocommerce_consumer_key || '');
        setWooConsumerSecret(eco.woocommerce_consumer_secret ? '••••••••••••' : '');
        setWooCartEnabled(eco.abandoned_cart_enabled);
        setWooCartMsg(eco.abandoned_cart_message || '');
        setWooTrackingEnabled(eco.tracking_alerts_enabled);
        setWooTrackingMsg(eco.tracking_message || '');
      }

      // Fetch Payments
      const { data: pay } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('organization_id', accountId)
        .maybeSingle();

      if (pay) {
        setRzpKeyId(pay.razorpay_key_id || '');
        setRzpKeySecret(pay.razorpay_key_secret ? '••••••••••••' : '');
        setUpiVpa(pay.upi_vpa || '');
        setUpiName(pay.upi_name || '');
      }
    } catch (err) {
      console.error('[integrations] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveEcommerce = async () => {
    if (!canEditSettings) {
      toast.error('You do not have permission to modify settings.');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ecommerce',
          data: {
            shopify_shop_url: shopifyShopUrl,
            shopify_access_token: shopifyAccessToken,
            woocommerce_store_url: wooStoreUrl,
            woocommerce_consumer_key: wooConsumerKey,
            woocommerce_consumer_secret: wooConsumerSecret,
            abandoned_cart_enabled: shopifyCartEnabled || wooCartEnabled,
            abandoned_cart_message: shopifyCartEnabled ? shopifyCartMsg : wooCartMsg,
            tracking_alerts_enabled: shopifyTrackingEnabled || wooTrackingEnabled,
            tracking_message: shopifyTrackingEnabled ? shopifyTrackingMsg : wooTrackingMsg,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save e-commerce configuration');
      }

      toast.success('E-commerce integration settings updated');
      setActiveModal(null);
      await fetchIntegrations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    if (!canEditSettings) {
      toast.error('You do not have permission to modify settings.');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment',
          data: {
            razorpay_key_id: rzpKeyId,
            razorpay_key_secret: rzpKeySecret,
            upi_vpa: upiVpa,
            upi_name: upiName,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save payment settings');
      }

      toast.success('Payment settings updated');
      setActiveModal(null);
      await fetchIntegrations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
    toast.success('Webhook target URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Integrations Hub"
        description="Sync conversations, contacts, and automated checkouts across Shopify/WooCommerce stores and request instant payments via SSLCommerz, bKash & Cards."
      />

      {/* Group 1: E-Commerce & Payment Gateways */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          E-Commerce & Payments
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Shopify Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">Shopify Integration</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {shopifyShopUrl ? `Connected to ${shopifyShopUrl}` : 'Sync checkouts and fulfillments'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    shopifyShopUrl
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${shopifyShopUrl ? 'bg-indigo-400' : 'bg-neutral-500'}`} />
                  {shopifyShopUrl ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Send cart recovery and tracking updates</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('shopify')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* WooCommerce Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">WooCommerce</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {wooStoreUrl ? `Connected to ${wooStoreUrl}` : 'Automate cart recovery via REST API'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    wooStoreUrl
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${wooStoreUrl ? 'bg-purple-400' : 'bg-neutral-500'}`} />
                  {wooStoreUrl ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Sync orders and alerts to WhatsApp</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('woocommerce')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* Razorpay Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">bKash / SSLCommerz (Razorpay API)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {rzpKeyId ? 'Merchant Keys Configured' : 'Generate invoice checkout links dynamically'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    rzpKeyId
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${rzpKeyId ? 'bg-blue-400' : 'bg-neutral-500'}`} />
                  {rzpKeyId ? 'Active' : 'Not Configured'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Generate and monitor billing checkouts</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('razorpay')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* UPI Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">bKash & Nagad QR Payments</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {upiVpa ? `VPA: ${upiVpa}` : 'Instant zero-fee customer QR codes'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    upiVpa
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${upiVpa ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                  {upiVpa ? 'Active' : 'Not Configured'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Generate scan-to-pay QR codes in chat</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('upi')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group 2: Databases & Spreadsheets (Stubs) */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Databases & Spreadsheets
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Google Sheets Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">Google Sheets</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {sheets.connected ? `Synced with "${sheets.sheetName}"` : 'Export leads and logs to spreadsheet'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    sheets.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${sheets.connected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                  {sheets.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Sync contacts or inbound messages automatically</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('sheets')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* Notion Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">Notion CRM</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {notion.connected ? 'Synced with workspace database' : 'Push chat contacts directly to Notion'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    notion.connected
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${notion.connected ? 'bg-purple-400' : 'bg-neutral-500'}`} />
                  {notion.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Create database entries on new inbound chats</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('notion')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group 3: Outgoing Webhooks & Workflow Engines (Stubs) */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Workflow Engines & Webhooks
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* n8n.io Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">n8n Node Integration</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {n8n.connected ? `Active on ${n8n.events.length} trigger events` : 'Self-hostable automation connector'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    n8n.connected
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${n8n.connected ? 'bg-orange-400' : 'bg-neutral-500'}`} />
                  {n8n.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Trigger n8n workflow urls directly</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('n8n')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* Make.com Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 hover:border-border/80 transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold text-foreground">Make Integration</CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate">
                  {make.connected ? `Hook: ${make.url}` : 'Link Make scenarios to message dispatches'}
                </CardDescription>
              </div>
              <div className="shrink-0 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    make.connected
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${make.connected ? 'bg-blue-400' : 'bg-neutral-500'}`} />
                  {make.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Receive updates on custom Make scenario webhooks</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-neutral-800/80 hover:bg-neutral-900"
                onClick={() => setActiveModal('make')}
              >
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================
          MODALS & DIALOGS
          ============================================================ */}

      {/* Shopify Dialog */}
      <Dialog open={activeModal === 'shopify'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[500px] border-border/80 bg-neutral-950/95 backdrop-blur-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              Shopify Integration Configuration
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Connect your Shopify store to enable abandoned checkout recovery and shipping tracking alerts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[380px] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Shopify Store URL</Label>
              <Input
                placeholder="your-store-name.myshopify.com"
                value={shopifyShopUrl}
                onChange={(e) => setShopifyShopUrl(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Admin API Access Token</Label>
              <Input
                type="password"
                placeholder="shpat_••••••••••••••••••••••••••••••••"
                value={shopifyAccessToken}
                onChange={(e) => setShopifyAccessToken(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>

            <div className="rounded-lg border border-neutral-800 p-3 space-y-3 bg-neutral-950/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold block">Abandoned Cart Recovery</Label>
                  <span className="text-[10px] text-muted-foreground">Send recovery alerts on checkouts abandon.</span>
                </div>
                <Switch checked={shopifyCartEnabled} onCheckedChange={setShopifyCartEnabled} />
              </div>
              {shopifyCartEnabled && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Cart Recovery Message Template</Label>
                  <Textarea
                    value={shopifyCartMsg}
                    onChange={(e) => setShopifyCartMsg(e.target.value)}
                    rows={3}
                    className="text-xs bg-neutral-900 border-neutral-850"
                  />
                  <span className="text-[9px] text-muted-foreground block">
                    {'Use tags: {{name}}, {{checkout_url}}, {{total_price}}'}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-neutral-800 p-3 space-y-3 bg-neutral-950/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold block">Shipping Alerts</Label>
                  <span className="text-[10px] text-muted-foreground">Send tracking details on order fulfillments.</span>
                </div>
                <Switch checked={shopifyTrackingEnabled} onCheckedChange={setShopifyTrackingEnabled} />
              </div>
              {shopifyTrackingEnabled && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Shipping Notification Template</Label>
                  <Textarea
                    value={shopifyTrackingMsg}
                    onChange={(e) => setShopifyTrackingMsg(e.target.value)}
                    rows={3}
                    className="text-xs bg-neutral-900 border-neutral-850"
                  />
                  <span className="text-[9px] text-muted-foreground block">
                    {'Use tags: {{name}}, {{tracking_number}}, {{carrier}}'}
                  </span>
                </div>
              )}
            </div>

            {accountId && (
              <div className="space-y-1 border-t border-neutral-800 pt-3">
                <Label className="text-xs font-semibold text-indigo-400 block">Shopify Webhook Target URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${hostUrl}/api/integrations/shopify/webhook?org_id=${accountId}`}
                    readOnly
                    className="text-xs bg-neutral-900 border-neutral-850 truncate font-mono text-muted-foreground"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() =>
                      copyToClipboard(
                        `${hostUrl}/api/integrations/shopify/webhook?org_id=${accountId}`,
                        'shopify-wh'
                      )
                    }
                  >
                    {copiedText === 'shopify-wh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight block">
                  Copy and paste this URL into Shopify Admin → Settings → Notifications → App Webhooks for `checkouts/create`, `checkouts/update`, and `orders/fulfilled` events.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-neutral-900" onClick={() => setActiveModal(null)} disabled={saving}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveEcommerce} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Shopify Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WooCommerce Dialog */}
      <Dialog open={activeModal === 'woocommerce'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[500px] border-border/80 bg-neutral-950/95 backdrop-blur-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              WooCommerce Configuration
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Link your WooCommerce storefront to trigger notifications for checkouts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[380px] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">WooCommerce Store URL</Label>
              <Input
                placeholder="https://your-store.com"
                value={wooStoreUrl}
                onChange={(e) => setWooStoreUrl(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Consumer Key</Label>
              <Input
                placeholder="ck_••••••••••••••••••••••••••••••••••••••••"
                value={wooConsumerKey}
                onChange={(e) => setWooConsumerKey(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Consumer Secret</Label>
              <Input
                type="password"
                placeholder="cs_••••••••••••••••••••••••••••••••••••••••"
                value={wooConsumerSecret}
                onChange={(e) => setWooConsumerSecret(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>

            <div className="rounded-lg border border-neutral-800 p-3 space-y-3 bg-neutral-950/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold block">Abandoned Cart Recovery</Label>
                </div>
                <Switch checked={wooCartEnabled} onCheckedChange={setWooCartEnabled} />
              </div>
              {wooCartEnabled && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Woo Cart Recovery Template</Label>
                  <Textarea
                    value={wooCartMsg}
                    onChange={(e) => setWooCartMsg(e.target.value)}
                    rows={3}
                    className="text-xs bg-neutral-900 border-neutral-850"
                  />
                </div>
              )}
            </div>

            {accountId && (
              <div className="space-y-1 border-t border-neutral-800 pt-3">
                <Label className="text-xs font-semibold text-purple-400 block">WooCommerce Webhook Target URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${hostUrl}/api/integrations/woocommerce/webhook?org_id=${accountId}`}
                    readOnly
                    className="text-xs bg-neutral-900 border-neutral-850 truncate font-mono text-muted-foreground"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() =>
                      copyToClipboard(
                        `${hostUrl}/api/integrations/woocommerce/webhook?org_id=${accountId}`,
                        'woo-wh'
                      )
                    }
                  >
                    {copiedText === 'woo-wh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-neutral-900" onClick={() => setActiveModal(null)} disabled={saving}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSaveEcommerce} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save WooCommerce config'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Razorpay Dialog */}
      <Dialog open={activeModal === 'razorpay'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[450px] border-border/80 bg-neutral-950/95 backdrop-blur-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Razorpay API Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Configure Razorpay API keys to generate payment links inside conversation composing boxes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-foreground">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Razorpay Key ID</Label>
              <Input
                placeholder="rzp_live_••••••••••••••"
                value={rzpKeyId}
                onChange={(e) => setRzpKeyId(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Razorpay Key Secret</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={rzpKeySecret}
                onChange={(e) => setRzpKeySecret(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>

            {accountId && (
              <div className="space-y-1 border-t border-neutral-800 pt-3">
                <Label className="text-xs font-semibold text-blue-400 block">Razorpay Webhook Target URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${hostUrl}/api/payments/razorpay/webhook?org_id=${accountId}`}
                    readOnly
                    className="text-xs bg-neutral-900 border-neutral-850 truncate font-mono text-muted-foreground"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() =>
                      copyToClipboard(
                        `${hostUrl}/api/payments/razorpay/webhook?org_id=${accountId}`,
                        'rzp-wh'
                      )
                    }
                  >
                    {copiedText === 'rzp-wh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight block">
                  Copy and paste this URL into Razorpay Dashboard → Settings → Webhooks for the `payment_link.paid` event.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-neutral-900" onClick={() => setActiveModal(null)} disabled={saving}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSavePayment} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Razorpay API Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPI Dialog */}
      <Dialog open={activeModal === 'upi'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[420px] border-border/80 bg-neutral-950/95 backdrop-blur-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              UPI payment Configuration
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Generate zero-commission QR codes dynamically inside your inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-foreground">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Merchant UPI ID (VPA)</Label>
              <Input
                placeholder="merchantname@okaxis"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Merchant Name</Label>
              <Input
                placeholder="e.g. Acme Agency Pvt Ltd"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="bg-neutral-900 border-neutral-850"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-neutral-900" onClick={() => setActiveModal(null)} disabled={saving}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSavePayment} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save UPI Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
