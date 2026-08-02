'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Globe,
  Copy,
  Check,
  Paperclip,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { uploadAccountMedia, deleteAccountMedia } from '@/lib/storage/upload-media';
import { CHAT_MEDIA_BUCKET } from '@/components/inbox/message-composer';

interface WidgetConfig {
  id?: string;
  bubble_text: string;
  welcome_message: string;
  agent_phone: string;
  avatar_url: string;
  position: 'left' | 'right';
  theme_color: string;
  is_active: boolean;
}

const COLOR_PRESETS = [
  { name: 'WhatsApp Green', value: '#25D366' },
  { name: 'Sleek Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
];

export function WhatsAppWidgetSettings() {
  const supabase = createClient();
  const { user, accountId, loading: authLoading, canEditSettings } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Widget Form State
  const [isActive, setIsActive] = useState(true);
  const [bubbleText, setBubbleText] = useState('Chat with us');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can we help you today?');
  const [agentPhone, setAgentPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [themeColor, setThemeColor] = useState('#25D366');

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [orgName, setOrgName] = useState('WhatsApp Support');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resolve script source URL
  const scriptHost = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://your-crm-domain.com';
  }, []);

  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !accountId) {
      loadedRef.current = null;
      setLoading(false);
      return;
    }
    if (loadedRef.current === accountId) return;
    loadedRef.current = accountId;
    fetchWidgetConfig();
  }, [authLoading, user, accountId]);

  async function fetchWidgetConfig(silent = false) {
    try {
      if (!silent) setLoading(true);
      if (!accountId) return;

      // Get Organization info for fallback/defaults
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', accountId)
        .maybeSingle();
      if (org) {
        setOrgName(org.name);
      }

      // Fetch existing widget configuration
      const { data, error } = await supabase
        .from('whatsapp_widgets')
        .select('*')
        .eq('organization_id', accountId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsActive(data.is_active);
        setBubbleText(data.bubble_text);
        setWelcomeMessage(data.welcome_message);
        setAgentPhone(data.agent_phone);
        setAvatarUrl(data.avatar_url || '');
        setPosition(data.position);
        setThemeColor(data.theme_color);
      } else {
        // Retrieve connected WABA phone number as a default fallback
        const { data: waba } = await supabase
          .from('waba_connections')
          .select('phone_number_id')
          .eq('organization_id', accountId)
          .maybeSingle();
        
        if (waba && waba.phone_number_id) {
          setAgentPhone(waba.phone_number_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch widget config:', err);
      toast.error('Failed to load widget configurations');
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (4 MB cap for avatars is reasonable)
    const limit = 4 * 1024 * 1024;
    if (file.size > limit) {
      toast.error('File size exceeds 4 MB limit.');
      return;
    }

    setUploadingMedia(true);
    try {
      const { publicUrl } = await uploadAccountMedia(CHAT_MEDIA_BUCKET, file);
      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const clearAvatar = () => {
    if (avatarUrl && accountId) {
      const pathSegment = avatarUrl.split('/').pop();
      if (pathSegment) {
        const fullPath = `account-${accountId}/${pathSegment}`;
        void deleteAccountMedia(CHAT_MEDIA_BUCKET, fullPath).catch(() => {});
      }
    }
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!agentPhone.trim()) {
      toast.error('WhatsApp Target Phone Number is required');
      return;
    }
    // Clean target phone (digits only, no spaces or special chars)
    const cleanPhone = agentPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    if (!accountId) return;

    setSaving(true);
    try {
      // Check if config exists first
      const { data: existing } = await supabase
        .from('whatsapp_widgets')
        .select('id')
        .eq('organization_id', accountId)
        .maybeSingle();

      const payload = {
        bubble_text: bubbleText.trim(),
        welcome_message: welcomeMessage.trim(),
        agent_phone: cleanPhone,
        avatar_url: avatarUrl || null,
        position,
        theme_color: themeColor,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('whatsapp_widgets')
          .update(payload)
          .eq('organization_id', accountId);

        if (error) throw error;
        toast.success('Widget configuration updated');
      } else {
        const { error } = await supabase.from('whatsapp_widgets').insert({
          account_id: accountId,
          organization_id: accountId,
          ...payload,
        });

        if (error) throw error;
        toast.success('Widget configuration created');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save widget configuration');
    } finally {
      setSaving(false);
    }
  }

  const embedCodeSnippet = useMemo(() => {
    return `<!-- N.C WaCRM WhatsApp Widget -->
<script 
  src="${scriptHost}/js/widget.js" 
  data-org-id="${accountId || 'YOUR_ORGANIZATION_ID'}" 
  defer>
</script>`;
  }, [scriptHost, accountId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopied(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Configuration Panel */}
      <Card className="lg:col-span-3 border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Website Chat Widget
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure and generate a floating WhatsApp widget to embed on your external website.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Active Switch */}
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active-widget" className="text-sm font-semibold text-foreground">
                    Enable Widget
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When disabled, the widget will be completely hidden from your website.
                  </p>
                </div>
                <Switch
                  id="active-widget"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={!canEditSettings || saving}
                />
              </div>

              {/* Embed Script Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-muted-foreground">Embed Snippet</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 px-2 text-primary hover:bg-primary/10 gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="relative rounded-lg border border-border/70 bg-black/40 p-3.5 font-mono text-[11px] leading-relaxed text-zinc-300 select-all overflow-x-auto whitespace-pre">
                  {embedCodeSnippet}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Paste this script tag inside the <code>&lt;head&gt;</code> or near the closing <code>&lt;/body&gt;</code> tag of your website.
                </p>
              </div>

              <hr className="border-border/30" />

              {/* Target Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone-input" className="text-muted-foreground">
                  Target WhatsApp Number
                </Label>
                <Input
                  id="phone-input"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  placeholder="8801712345678"
                  required
                  disabled={!canEditSettings || saving}
                  className="bg-muted/50 border-border text-foreground"
                />
                <p className="text-[10px] text-muted-foreground">
                  Include the Bangladesh country code without any plus (+), hyphens (-), or spaces (e.g. &quot;880&quot; followed by the mobile number).
                </p>
              </div>

              {/* Bubble Text */}
              <div className="space-y-1.5">
                <Label htmlFor="bubble-input" className="text-muted-foreground">
                  Bubble Label text
                </Label>
                <Input
                  id="bubble-input"
                  value={bubbleText}
                  onChange={(e) => setBubbleText(e.target.value.slice(0, 30))}
                  placeholder="Chat with us"
                  required
                  disabled={!canEditSettings || saving}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              {/* Welcome Message */}
              <div className="space-y-1.5">
                <Label htmlFor="welcome-input" className="text-muted-foreground">
                  Welcome Message
                </Label>
                <Textarea
                  id="welcome-input"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value.slice(0, 200))}
                  placeholder="Hi! How can we help you today?"
                  required
                  rows={3}
                  disabled={!canEditSettings || saving}
                  className="bg-muted/50 border-border text-foreground resize-none"
                />
              </div>

              {/* Custom Header Avatar */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Widget Avatar Image</Label>
                {avatarUrl ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5">
                    <div className="flex items-center gap-2 text-xs truncate">
                      <img src={avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover shrink-0" />
                      <span className="truncate text-foreground select-all text-xs">
                        {avatarUrl.split('/').pop() || 'Avatar'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAvatar}
                      disabled={!canEditSettings || saving}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={!canEditSettings || saving}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingMedia || !canEditSettings || saving}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-border/60 hover:bg-muted text-muted-foreground"
                    >
                      {uploadingMedia ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Upload Custom Logo
                    </Button>
                  </div>
                )}
              </div>

              {/* Theme Color Picker */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Theme Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setThemeColor(preset.value)}
                      disabled={!canEditSettings || saving}
                      className={cn(
                        "h-8 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white transition-all shadow-sm shrink-0 border border-transparent",
                        themeColor === preset.value && "scale-105 border-white/50 ring-2 ring-primary/40"
                      )}
                      style={{ backgroundColor: preset.value }}
                    >
                      {preset.name}
                    </button>
                  ))}
                  
                  {/* Custom Hex input */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div
                      className="h-6 w-6 rounded-full border border-border shadow-inner"
                      style={{ backgroundColor: themeColor }}
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      disabled={!canEditSettings || saving}
                      placeholder="#25D366"
                      className="h-8 w-24 text-xs font-mono bg-muted/65 text-foreground border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Widget Alignment</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={position === 'left' ? 'default' : 'outline'}
                    onClick={() => setPosition('left')}
                    disabled={!canEditSettings || saving}
                    className="flex-1 h-9 text-xs"
                  >
                    Align Bottom Left
                  </Button>
                  <Button
                    type="button"
                    variant={position === 'right' ? 'default' : 'outline'}
                    onClick={() => setPosition('right')}
                    disabled={!canEditSettings || saving}
                    className="flex-1 h-9 text-xs"
                  >
                    Align Bottom Right
                  </Button>
                </div>
              </div>

              {canEditSettings && (
                <Button
                  type="submit"
                  disabled={saving || uploadingMedia}
                  className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 mt-2"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Widget Configuration'}
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Live Preview Panel */}
      <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-md flex flex-col justify-between overflow-hidden relative min-h-[460px]">
        <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Live Preview
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            Simulates the look and feel on your external website.
          </CardDescription>
        </CardHeader>

        {/* Browser Sandbox viewport */}
        <div className="flex-1 bg-zinc-900/40 p-4 flex items-center justify-center relative bg-dot-grid overflow-hidden">
          {isActive ? (
            <div
              className={cn(
                "absolute bottom-4 flex flex-col items-end gap-3 transition-all duration-300",
                position === 'left' ? 'left-4 items-start' : 'right-4 items-end'
              )}
            >
              {/* Simulated chat window */}
              <div
                className="w-[280px] bg-[#F0F2F5] rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-border/30"
                style={{ height: '340px' }}
              >
                {/* Header */}
                <div
                  className="p-3 text-white flex items-center justify-between relative"
                  style={{ backgroundColor: themeColor }}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-full bg-white/20 border border-white/25 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        getInitials(orgName)
                      )}
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-emerald-500 rounded-full" style={{ borderColor: themeColor }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold truncate leading-snug">{orgName}</span>
                      <span className="text-[9px] opacity-80 leading-none mt-0.5">Online • Replies instantly</span>
                    </div>
                  </div>
                  <button type="button" className="opacity-80 hover:opacity-100 p-0.5 rounded-full hover:bg-white/10 text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-3 overflow-y-auto bg-cover flex flex-col bg-slate-100 bg-[radial-gradient(#dfdfdf_0.5px,transparent_0.5px),_radial-gradient(#dfdfdf_0.5px,#f3f4f6_0.5px)] bg-[size:10px_10px] bg-[position:0_0,_5px_5px]">
                  <div className="bg-white text-zinc-800 text-xs p-2.5 rounded-r-lg rounded-bl-lg max-w-[85%] shadow-sm leading-normal self-start">
                    <p className="whitespace-pre-wrap">{welcomeMessage || 'Hi there! How can we help you?'}</p>
                    <p className="text-[9px] text-zinc-400 mt-1.5 text-right">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Footer Input */}
                <div className="bg-white p-2 border-t border-border/30 flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    readOnly
                    className="h-8 rounded-full bg-zinc-50 border-zinc-200 text-xs text-zinc-500"
                  />
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                    style={{ backgroundColor: themeColor }}
                  >
                    <svg className="h-4 w-4 fill-white translate-x-[1px]" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Trigger Bubble */}
              <div
                className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center relative cursor-pointer group"
                style={{ backgroundColor: themeColor }}
              >
                <div className="absolute top-[2px] right-[2px] h-2.5 w-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.638 2.003 14.162.98 11.53.98c-5.437 0-9.862 4.371-9.866 9.8.001 1.762.485 3.479 1.402 5.004l-.993 3.628 3.784-.984zm11.087-6.834c.307-.154.512-.228.615-.385.102-.157.102-.912-.154-1.27-.256-.358-1.025-1.41-1.371-1.82-.346-.412-.718-.328-.974-.328-.242 0-.52-.01-.795-.01-.275 0-.723.102-1.102.513-.38.411-1.447 1.41-1.447 3.44 0 2.029 1.488 3.99 1.693 4.247.205.257 2.928 4.437 7.094 6.236 4.167 1.8 4.167 1.2 4.936 1.114.769-.086 2.486-1.01 2.846-1.986.36-.976.36-1.815.252-1.985-.108-.17-.395-.27-.703-.424z" />
                </svg>

                {/* Floating tooltip preview */}
                <div
                  className={cn(
                    "absolute bottom-14 bg-white text-zinc-800 text-[11px] font-semibold px-2 py-1 shadow-md rounded border border-zinc-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap",
                    position === 'left' ? 'left-0' : 'right-0'
                  )}
                >
                  {bubbleText}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-black/20 rounded-xl border border-dashed border-border/40 max-w-[240px]">
              <MessageSquare className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              <h4 className="text-zinc-300 font-semibold text-xs">Widget is disabled</h4>
              <p className="text-zinc-500 text-[10px] mt-1">Enable widget to see simulated floating preview.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
