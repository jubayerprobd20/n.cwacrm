'use client';

import { useEffect, useState, useCallback } from 'react';
import { CreditCard, Check, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PLAN_TIERS, getPlanById } from '@/lib/billing/plans';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DBOrganization {
  plan: string;
  subscription_status: string;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
}

export function BillingSettings() {
  const { accountId, canEditSettings, profile } = useAuth();
  const [org, setOrg] = useState<DBOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    messagesSent: number;
    messageLimit: number;
    totalContacts: number;
    contactLimit: number;
    planName: string;
    unlimited: boolean;
  } | null>(null);

  const fetchBillingContext = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('plan, subscription_status, razorpay_customer_id, razorpay_subscription_id')
        .eq('id', accountId)
        .single();

      if (error) {
        console.error('[BillingSettings] Failed to fetch organization details:', error);
        toast.error('Failed to load billing settings');
      } else if (data) {
        setOrg(data as DBOrganization);
      }

      // Fetch usage metrics
      const usageRes = await fetch(`/api/billing/usage?organizationId=${accountId}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (err) {
      console.error('[BillingSettings] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBillingContext();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBillingContext]);

  const handleUpgrade = async (planId: string) => {
    if (!canEditSettings || !accountId) {
      toast.error('Only owners and administrators can change subscription plans.');
      return;
    }

    const hasExistingSub = org?.razorpay_subscription_id && org?.subscription_status !== 'canceled';

    setCheckoutLoading(planId);
    toast.info(hasExistingSub ? 'Scheduling plan change...' : 'Initializing checkout session...');

    try {
      if (hasExistingSub) {
        const response = await fetch('/api/billing/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: accountId,
            planId,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error(data.error || 'Failed to schedule plan change.');
          setCheckoutLoading(null);
          return;
        }

        toast.success('Plan change scheduled! Your plan will update at the end of the current billing cycle.');
        setTimeout(() => {
          fetchBillingContext();
          window.location.reload();
        }, 1500);
        return;
      }

      // New subscriber checkout flow
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: accountId,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(data.error || 'Failed to initiate checkout session.');
        setCheckoutLoading(null);
        return;
      }

      // Load Razorpay checkout script dynamically
      const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
          if ((window as unknown as Record<string, unknown>).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.info('Opening checkout on Razorpay...');
        window.location.assign(data.shortUrl);
        return;
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'N.C WaCRM',
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        handler: function () {
          toast.success('Subscription created successfully! Updating settings...');
          // Give webhook a tiny window to update and fetch new context
          setTimeout(() => {
            fetchBillingContext();
            window.location.reload();
          }, 1500);
        },
        prefill: {
          name: profile?.full_name || '',
          email: profile?.email || '',
        },
        theme: {
          color: '#3B82F6', // Blue accent matching dashboard
        },
      };

      const rzp = new (window as unknown as {
        Razorpay: new (options: unknown) => { open: () => void };
      }).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('[BillingSettings] Checkout error:', err);
      toast.error('An error occurred during checkout setup.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentPlanId = org?.plan || 'free';
  const currentPlan = getPlanById(currentPlanId);
  const subscriptionStatus = org?.subscription_status || 'trialing';

  // Helper to choose badge colors based on subscription status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-semibold">Trialing</Badge>;
      case 'past_due':
        return <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 font-semibold">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Define visual plans config
  const planCards = [
    {
      id: 'starter',
      name: 'Starter',
      price: PLAN_TIERS.starter.price,
      messageLimit: '5,000 / mo',
      contactLimit: '1,000 contacts',
      popular: false,
      features: [
        '1 WhatsApp number session',
        '1,000 Contacts limit',
        'Shared Inbox (Up to 3 agents)',
        'Basic Auto-Responder',
        'Scheduled broadcasts',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: PLAN_TIERS.pro.price,
      messageLimit: '50,000 / mo',
      contactLimit: '10,000 contacts',
      popular: true,
      features: [
        '3 WhatsApp number sessions',
        '10,000 Contacts limit',
        'Unlimited Inbox Agents',
        'No-code Chatbot Flow Builder',
        'AI Reply Assistant (BYO Key)',
        'Priority email/chat support',
      ],
    },
    {
      id: 'business',
      name: 'Business Suite',
      price: PLAN_TIERS.business.price,
      messageLimit: 'Unlimited',
      contactLimit: 'Unlimited contacts',
      popular: false,
      features: [
        'Unlimited WhatsApp numbers',
        'Unlimited Contacts & Uploads',
        'White-label portal options',
        'Custom domain mapping',
        'School/ERP & InvoBill connect',
        '24/7 Dedicated account manager',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Current Subscription Status */}
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-foreground">
                    {currentPlan.name} Plan
                  </h3>
                  {getStatusBadge(subscriptionStatus)}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current limits: {currentPlan.unlimited ? 'Unlimited' : `${currentPlan.message_quota.toLocaleString()} messages`} · {currentPlan.unlimited ? 'Unlimited' : `${currentPlan.contact_limit.toLocaleString()} contacts`}
                </p>
              </div>
            </div>

            {subscriptionStatus === 'canceled' && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-xs text-rose-400 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Subscription is canceled. Upgrade below to regain access.
              </div>
            )}

            {subscriptionStatus === 'past_due' && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-400 font-medium animate-pulse">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Payment failed. Please retry your subscription below.
              </div>
            )}
          </div>

          {/* Quota Usage Progress Indicators */}
          {usage && (
            <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Messages Sent Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Monthly Messages Sent</span>
                  <span className="text-foreground">
                    {usage.messagesSent.toLocaleString()} / {usage.unlimited ? 'Unlimited' : usage.messageLimit.toLocaleString()}
                  </span>
                </div>
                {!usage.unlimited ? (
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (usage.messagesSent / usage.messageLimit) >= 1.0 ? "bg-rose-500" :
                        (usage.messagesSent / usage.messageLimit) >= 0.85 ? "bg-amber-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (usage.messagesSent / usage.messageLimit) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full w-full rounded-full bg-emerald-500/80" />
                  </div>
                )}
                {usage.messagesSent >= usage.messageLimit && !usage.unlimited && (
                  <p className="text-4xs text-rose-400 font-medium animate-pulse">Message limit reached. Please upgrade your plan to continue broadcasting.</p>
                )}
              </div>

              {/* Total Contacts Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Total Contacts Saved</span>
                  <span className="text-foreground">
                    {usage.totalContacts.toLocaleString()} / {usage.unlimited ? 'Unlimited' : usage.contactLimit.toLocaleString()}
                  </span>
                </div>
                {!usage.unlimited ? (
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (usage.totalContacts / usage.contactLimit) >= 1.0 ? "bg-rose-500" :
                        (usage.totalContacts / usage.contactLimit) >= 0.85 ? "bg-amber-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (usage.totalContacts / usage.contactLimit) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full w-full rounded-full bg-emerald-500/80" />
                  </div>
                )}
                {usage.totalContacts >= usage.contactLimit && !usage.unlimited && (
                  <p className="text-4xs text-amber-400 font-medium font-semibold animate-pulse">Contact limit reached. Storing new contacts remains enabled, but please upgrade soon.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!canEditSettings && (
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 px-4.5 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          You are viewing billing in read-only mode. Only Workspace Owners and Administrators can manage subscription billing.
        </div>
      )}

      {/* Plan Selection Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {planCards.map((planCard) => {
          const isCurrent = currentPlanId === planCard.id;
          const isHigher =
            (planCard.id === 'pro' && currentPlanId === 'starter') ||
            (planCard.id === 'business' && (currentPlanId === 'starter' || currentPlanId === 'pro')) ||
            currentPlanId === 'free';
          const isUpgrading = checkoutLoading === planCard.id;

          return (
            <Card
              key={planCard.id}
              className={cn(
                'relative flex flex-col justify-between border bg-card/60 backdrop-blur-md transition-all duration-300',
                planCard.popular ? 'border-primary/50 shadow-lg shadow-primary/5' : 'border-border/50',
                isCurrent && 'ring-2 ring-primary/45 border-primary/50'
              )}
            >
              {planCard.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-4xs font-black uppercase tracking-wider text-white shadow-lg">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-4 rounded-full bg-emerald-500/25 border border-emerald-500/50 text-emerald-400 px-3 py-0.5 text-4xs font-black uppercase tracking-wider shadow-lg">
                  Current
                </span>
              )}

              <div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {planCard.name}
                  </CardTitle>
                  <CardDescription className="text-2xs text-muted-foreground mt-1 min-h-[32px]">
                    Limits: {planCard.messageLimit} · {planCard.contactLimit}
                  </CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-2xl font-semibold text-foreground">৳</span>
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {planCard.price.toLocaleString('en-BD')}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>

                <CardContent className="pb-6">
                  <ul className="space-y-2.5">
                    {planCard.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-foreground/80">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <div className="p-6 pt-0 mt-auto">
                {isCurrent ? (
                  <Button className="w-full bg-neutral-900 border border-neutral-800 text-muted-foreground cursor-default" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(planCard.id)}
                    className={cn(
                      'w-full py-4.5 h-auto text-xs font-semibold shadow-lg transition-all',
                      planCard.popular
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                        : 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800'
                    )}
                    disabled={!canEditSettings || !!checkoutLoading}
                  >
                    {isUpgrading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : isHigher ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1" /> Upgrade
                      </>
                    ) : (
                      'Change Plan'
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-4xs text-muted-foreground mt-4">
        All plans are billed monthly. Secure payments processed via SSLCommerz, bKash & Cards. Cancel anytime under your dashboard settings.
      </div>
    </div>
  );
}
