'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Clock, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface DailyHourConfig {
  enabled: boolean;
  open: string;
  close: string;
}

const COMMON_TIMEZONES = [
  { name: 'Bangladesh Standard Time (BST) - Asia/Dhaka', value: 'Asia/Dhaka' },
  { name: 'Coordinated Universal Time (UTC)', value: 'UTC' },
  { name: 'Eastern Time (ET) - America/New_York', value: 'America/New_York' },
  { name: 'Pacific Time (PT) - America/Los_Angeles', value: 'America/Los_Angeles' },
  { name: 'Greenwich Mean Time (GMT) - Europe/London', value: 'Europe/London' },
  { name: 'Central European Time (CET) - Europe/Paris', value: 'Europe/Paris' },
  { name: 'Gulf Standard Time (GST) - Asia/Dubai', value: 'Asia/Dubai' },
  { name: 'Singapore Standard Time (SGT) - Asia/Singapore', value: 'Asia/Singapore' },
  { name: 'Australian Eastern Time (AET) - Australia/Sydney', value: 'Australia/Sydney' },
];

const DAYS_ORDER = [
  { index: '1', name: 'Monday' },
  { index: '2', name: 'Tuesday' },
  { index: '3', name: 'Wednesday' },
  { index: '4', name: 'Thursday' },
  { index: '5', name: 'Friday' },
  { index: '6', name: 'Saturday' },
  { index: '0', name: 'Sunday' },
];

const DEFAULT_HOURS: Record<string, DailyHourConfig> = {
  '0': { enabled: false, open: '09:00', close: '18:00' },
  '1': { enabled: true, open: '09:00', close: '18:00' },
  '2': { enabled: true, open: '09:00', close: '18:00' },
  '3': { enabled: true, open: '09:00', close: '18:00' },
  '4': { enabled: true, open: '09:00', close: '18:00' },
  '5': { enabled: true, open: '09:00', close: '18:00' },
  '6': { enabled: false, open: '09:00', close: '18:00' },
};

export function BusinessHoursSettings() {
  const supabase = createClient();
  const { user, accountId, loading: authLoading, canEditSettings } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [isEnabled, setIsEnabled] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [oooMessage, setOooMessage] = useState(
    'Thank you for your message. We are currently closed and will get back to you during our working hours.'
  );
  const [dailyHours, setDailyHours] = useState<Record<string, DailyHourConfig>>(DEFAULT_HOURS);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !accountId) {
      setLoading(false);
      return;
    }
    fetchBusinessHours();
  }, [authLoading, user, accountId]);

  async function fetchBusinessHours() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('organization_id', accountId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsEnabled(data.is_enabled);
        setTimezone(data.timezone || 'Asia/Dhaka');
        setOooMessage(data.ooo_message || '');
        if (data.daily_hours && typeof data.daily_hours === 'object') {
          // Merge defaults with saved keys in case of missing days
          setDailyHours({
            ...DEFAULT_HOURS,
            ...(data.daily_hours as Record<string, DailyHourConfig>),
          });
        }
      }
    } catch (err) {
      console.error('[business-hours] fetch failed:', err);
      toast.error('Failed to load business hours settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!canEditSettings) {
      toast.error('You do not have permission to modify settings.');
      return;
    }
    if (!accountId) return;

    try {
      setSaving(true);

      const payload = {
        organization_id: accountId,
        is_enabled: isEnabled,
        timezone,
        ooo_message: oooMessage.trim(),
        daily_hours: dailyHours,
      };

      const { error } = await supabase
        .from('business_hours')
        .upsert(payload, { onConflict: 'organization_id' });

      if (error) throw error;
      toast.success('Business hours saved successfully');
    } catch (err) {
      console.error('[business-hours] save failed:', err);
      toast.error('Failed to save business hours');
    } finally {
      setSaving(false);
    }
  }

  const handleDayToggle = (dayIndex: string, enabled: boolean) => {
    setDailyHours((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        enabled,
      },
    }));
  };

  const handleTimeChange = (dayIndex: string, type: 'open' | 'close', val: string) => {
    setDailyHours((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [type]: val,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Business Hours & Out-of-Office</CardTitle>
        </div>
        <CardDescription>
          Define your operating timezone and daily operating hours. Automatically route OOO replies
          to customers outside working hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Enable OOO Auto-Reply</Label>
            <p className="text-xs text-muted-foreground">
              Automatically trigger Out-of-Office replies outside specified operating hours.
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            disabled={!canEditSettings || saving}
          />
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operating Timezone
          </Label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!canEditSettings || saving}
            className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.name}
              </option>
            ))}
          </select>
        </div>

        {/* Day Schedule */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daily Hours
          </Label>
          <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border/50">
            {DAYS_ORDER.map((day) => {
              const config = dailyHours[day.index] || DEFAULT_HOURS[day.index];
              return (
                <div key={day.index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => handleDayToggle(day.index, checked)}
                      disabled={!canEditSettings || saving}
                      id={`day-toggle-${day.index}`}
                    />
                    <Label htmlFor={`day-toggle-${day.index}`} className="text-sm font-medium capitalize cursor-pointer">
                      {day.name}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={config.open}
                      onChange={(e) => handleTimeChange(day.index, 'open', e.target.value)}
                      disabled={!config.enabled || !canEditSettings || saving}
                      className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-foreground outline-none disabled:opacity-40"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={config.close}
                      onChange={(e) => handleTimeChange(day.index, 'close', e.target.value)}
                      disabled={!config.enabled || !canEditSettings || saving}
                      className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-foreground outline-none disabled:opacity-40"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OOO Message */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Out-of-Office Auto-Reply Message
          </Label>
          <Textarea
            value={oooMessage}
            onChange={(e) => setOooMessage(e.target.value)}
            disabled={!canEditSettings || saving}
            placeholder="Type your OOO reply message..."
            rows={3}
            className="bg-muted border-border text-sm resize-none"
          />
        </div>

        {/* Action Button */}
        {canEditSettings && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Configuration
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
