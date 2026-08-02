"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Crown,
  Building2,
  DollarSign,
  MessageSquare,
  Users,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string;
  created_at: string;
  owner_email?: string;
}

export default function AdminOverviewPage() {
  const { impersonateOrganization } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalPaidOrganizations: 0,
    totalMrrBdt: 0,
    totalMrrUsd: 0,
    totalContacts: 0,
    totalMessages: 0,
    planDistribution: { free: 0, starter: 0, pro: 0, business: 0 } as Record<string, number>,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes] = await Promise.all([
        fetch("/api/super-admin/stats"),
        fetch("/api/super-admin/organizations"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }
    } catch (err) {
      console.error("[AdminOverview] Error loading data:", err);
      toast.error("Failed to load SaaS admin statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleImpersonate = (org: Organization) => {
    impersonateOrganization(org.id, org.name);
    toast.success(`Entering workspace: ${org.name} as Owner`);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading Executive SaaS Overview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 font-semibold px-3 py-1">
                <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-300 inline" />
                SaaS Level 0 Governance
              </Badge>
              <Badge className="bg-emerald-500 text-white border-0 font-medium">
                100% Isolated Admin System
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              NextCore SaaS Master Control
            </h1>
            <p className="text-sm text-white/90 max-w-2xl mt-1.5 leading-relaxed">
              Complete A to Z platform oversight: monitor recurring revenue, inspect customer workspaces, manage subscription tiers, and configure platform pricing in a standalone executive environment.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={fetchOverviewData}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Customer Organizations
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.totalOrganizations}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Active tenant businesses on platform</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Monthly Recurring Revenue (MRR)
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
              ৳{stats.totalMrrBdt.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              approx ${stats.totalMrrUsd.toLocaleString()} USD • {stats.totalPaidOrganizations} paid subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Processed Messages
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              WhatsApp messages broadcasted system-wide
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Customer CRM Contacts
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.totalContacts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer leads managed across all tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown & Recent Onboarding */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Subscription Tier Breakdown
            </CardTitle>
            <CardDescription>
              Customer distribution across plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.planDistribution || {}).map(([planKey, count]) => {
              const pct =
                stats.totalOrganizations > 0
                  ? Math.round((count / stats.totalOrganizations) * 100)
                  : 0;
              return (
                <div key={planKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold capitalize">{planKey} Plan</span>
                    <span className="text-muted-foreground text-xs">
                      {count} {count === 1 ? "org" : "orgs"} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Recently Onboarded Customer Organizations
              </CardTitle>
              <CardDescription>
                Latest businesses added to NextCore WhatsApp CRM
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/organizations")}
            >
              View All ({organizations.length})
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizations.slice(0, 6).map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {org.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Owner: {org.owner_email || "N/A"} • Joined{" "}
                        {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize font-semibold text-xs border-amber-500/30 bg-amber-500/5 text-amber-600"
                    >
                      {org.plan}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleImpersonate(org)}
                      className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs font-bold px-3 shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Impersonate Workspace
                    </Button>
                  </div>
                </div>
              ))}
              {organizations.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No organizations found yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
