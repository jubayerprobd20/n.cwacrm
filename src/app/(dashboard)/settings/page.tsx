'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { SettingsRail } from '@/components/settings/settings-rail';
import { SettingsOverview } from '@/components/settings/settings-overview';
import { ProfileForm } from '@/components/settings/profile-form';
import { SecurityPanel } from '@/components/settings/security-panel';
import { AppearancePanel } from '@/components/settings/appearance-panel';
import { WhatsAppConfig } from '@/components/settings/whatsapp-config';
import { TemplateManager } from '@/components/settings/template-manager';
import { QuickRepliesManager } from '@/components/settings/quick-replies-manager';
import { FieldsAndTagsPanel } from '@/components/settings/fields-and-tags-panel';
import { DealsSettings } from '@/components/settings/deals-settings';
import { MembersTab } from '@/components/settings/members-tab';
import { BillingSettings } from '@/components/settings/billing-settings';
import { ApiKeysSettings } from '@/components/settings/api-keys-settings';
import { IntegrationsPanel } from '@/components/settings/integrations-panel';
import { CannedResponsesSettings } from '@/components/settings/canned-responses-settings';
import { WhatsAppWidgetSettings } from '@/components/settings/whatsapp-widget-settings';
import { BusinessHoursSettings } from '@/components/settings/business-hours-settings';
import { AccountTypePanel } from '@/components/settings/account-type-panel';
import { ResellerPanel } from '@/components/settings/reseller-panel';
import {
  resolveSection,
  type SettingsSection,
} from '@/components/settings/settings-sections';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultCurrency } = useAuth();
  const { mode } = useTheme();
  const t = useTranslations('Settings');

  // Local state for instant 1-click tab switching without router latency
  const urlSection = resolveSection(searchParams.get('tab'));
  const [activeSection, setActiveSection] = useState<SettingsSection>(urlSection);

  useEffect(() => {
    setActiveSection(resolveSection(searchParams.get('tab')));
  }, [searchParams]);

  const go = (next: SettingsSection) => {
    setActiveSection(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    window.history.replaceState(null, '', `/settings?${params.toString()}`);
  };

  // Cheap, fetch-free rail hints. The Overview landing carries the
  // full live status/counts; the rail just surfaces the two that are
  // already in context.
  const hints: Partial<Record<SettingsSection, ReactNode>> = useMemo(
    () => ({
      appearance: mode.charAt(0).toUpperCase() + mode.slice(1),
      deals: defaultCurrency,
    }),
    [mode, defaultCurrency],
  );

  const panel: Record<SettingsSection, ReactNode> = {
    overview: <SettingsOverview onSelect={go} />,
    profile: <ProfileForm />,
    security: <SecurityPanel />,
    appearance: <AppearancePanel />,
    whatsapp: <WhatsAppConfig />,
    templates: <TemplateManager />,
    canned: <CannedResponsesSettings />,
    widget: <WhatsAppWidgetSettings />,
    business_hours: <BusinessHoursSettings />,
    fields: <FieldsAndTagsPanel />,
    deals: <DealsSettings />,
    members: <MembersTab />,
    billing: <BillingSettings />,
    api: <ApiKeysSettings />,
    integrations: <IntegrationsPanel />,
    account_type: <AccountTypePanel />,
    reseller: <ResellerPanel />,
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('pageDesc')}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start">
        <SettingsRail active={activeSection} onSelect={go} hints={hints} />
        <div className="min-w-0">{panel[activeSection]}</div>
      </div>
    </div>
  );
}
