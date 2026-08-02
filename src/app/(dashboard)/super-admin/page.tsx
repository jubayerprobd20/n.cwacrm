"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crown,
  Shield,
  Users,
  DollarSign,
  MessageSquare,
  Search,
  Filter,
  ArrowUpRight,
  LogOut,
  Edit,
  Save,
  CheckCircle,
  AlertCircle,
  Ban,
  RefreshCw,
  Zap,
  Building2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  owner_name?: string;
}

interface SaasPlan {
  id: string;
  name: string;
  price_bdt: number;
  price_usd: number;
  message_quota: number;
  contact_limit: number;
  message_limit_label: string;
  contact_limit_label: string;
  features: string[];
  unlimited: boolean;
  is_popular: boolean;
  is_active: boolean;
}

export default function SuperAdminPage() {
  const { isSuperAdmin, impersonateOrganization, profileLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

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
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog states
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgPlanModalOpen, setOrgPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState("free");
  const [newStatus, setNewStatus] = useState("active");
  const [updatingOrg, setUpdatingOrg] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<SaasPlan | null>(null);
  const [planEditModalOpen, setPlanEditModalOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (!profileLoading && !isSuperAdmin) {
      toast.error("Access denied: Only SaaS Super Admin can access this panel.");
      router.push("/dashboard");
    }
  }, [isSuperAdmin, profileLoading, router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes, plansRes] = await Promise.all([
        fetch("/api/super-admin/stats"),
        fetch("/api/super-admin/organizations"),
        fetch("/api/super-admin/plans"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans || []);
      }
    } catch (err) {
      console.error("[SuperAdmin] Error loading data:", err);
      toast.error("Failed to load SaaS admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllData();
    }
  }, [isSuperAdmin]);

  const handleTabChange = (tab: string) => {
    router.replace(`/super-admin?tab=${tab}`, { scroll: false });
  };

  const handleImpersonate = (org: Organization) => {
    impersonateOrganization(org.id, org.name);
    toast.success(`Entered workspace: ${org.name} as Super Admin`);
    router.push("/dashboard");
  };

  const handleOpenPlanModal = (org: Organization) => {
    setSelectedOrg(org);
    setNewPlan(org.plan || "free");
    setNewStatus(org.subscription_status || "active");
    setOrgPlanModalOpen(true);
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;
    setUpdatingOrg(true);
    try {
      const res = await fetch("/api/super-admin/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrg.id,
          plan: newPlan,
          subscription_status: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update organization");
      }

      toast.success(`Updated ${selectedOrg.name} plan to ${newPlan.toUpperCase()}`);
      setOrgPlanModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization");
    } finally {
      setUpdatingOrg(false);
    }
  };

  const handleToggleSuspend = async (org: Organization) => {
    const isSuspended = org.subscription_status === "suspended";
    const nextStatus = isSuspended ? "active" : "suspended";

    try {
      const res = await fetch("/api/super-admin/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: org.id,
          subscription_status: nextStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to change status");
      }

      toast.success(
        `Organization ${org.name} has been ${isSuspended ? "reactivated" : "suspended"}`
      );
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const handleOpenPlanEditor = (plan: SaasPlan) => {
    setSelectedPlan({ ...plan });
    setPlanEditModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!selectedPlan) return;
    setSavingPlan(true);
    try {
      const res = await fetch("/api/super-admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPlan),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update plan");
      }

      toast.success(`Successfully saved plan: ${selectedPlan.name}`);
      setPlanEditModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
    } finally {
      setSavingPlan(false);
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.owner_email && org.owner_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan =
      filterPlan === "all" || org.plan.toLowerCase() === filterPlan.toLowerCase();

    const matchesStatus =
      filterStatus === "all" ||
      org.subscription_status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesPlan && matchesStatus;
  });

  if (profileLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading SaaS Master Admin Control Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 font-semibold px-3 py-1">
                <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-300 inline" />
                SaaS Master Super-Admin
              </Badge>
              <Badge className="bg-emerald-500 text-white border-0">
                System Healthy
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Enterprise SaaS Management Portal
            </h1>
            <p className="text-sm text-white/90 max-w-2xl mt-1">
              Complete A to Z platform control: manage customer accounts, switch workspaces, configure plans and pricing dynamically, and monitor platform revenue.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={fetchAllData}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/20">
          <Button
            size="sm"
            onClick={() => handleTabChange("overview")}
            className={cn(
              "rounded-lg px-4 font-semibold transition-all",
              activeTab === "overview"
                ? "bg-white text-orange-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Platform Overview
          </Button>
          <Button
            size="sm"
            onClick={() => handleTabChange("organizations")}
            className={cn(
              "rounded-lg px-4 font-semibold transition-all",
              activeTab === "organizations"
                ? "bg-white text-orange-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Customer Organizations ({organizations.length})
          </Button>
          <Button
            size="sm"
            onClick={() => handleTabChange("plans")}
            className={cn(
              "rounded-lg px-4 font-semibold transition-all",
              activeTab === "plans"
                ? "bg-white text-orange-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Layers className="h-4 w-4 mr-2" />
            Plans & Pricing Editor ({plans.length})
          </Button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customer Organizations
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active tenants on platform
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Recurring Revenue (MRR)
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  ৳{stats.totalMrrBdt.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${stats.totalMrrUsd.toLocaleString()} USD approx • {stats.totalPaidOrganizations} paid accounts
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Messages Processed
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  System-wide WhatsApp messages
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Stored Contacts
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all CRM tenants
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Plan Distribution & Recent Orgs */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Subscription Plan Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of customer tiers across the SaaS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.planDistribution || {}).map(([planKey, count]) => {
                  const pct =
                    stats.totalOrganizations > 0
                      ? Math.round((count / stats.totalOrganizations) * 100)
                      : 0;
                  return (
                    <div key={planKey} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{planKey} Plan</span>
                        <span className="text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
                  <CardTitle className="text-base font-semibold">
                    Recently Registered Organizations
                  </CardTitle>
                  <CardDescription>
                    Latest businesses onboarded to WhatsApp CRM
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTabChange("organizations")}
                >
                  View All ({organizations.length})
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations.slice(0, 5).map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
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
                          className="capitalize font-semibold text-xs"
                        >
                          {org.plan}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleImpersonate(org)}
                          className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs font-semibold"
                        >
                          Manage Workspace
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ORGANIZATIONS TAB */}
      {activeTab === "organizations" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, slug, owner email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={filterPlan}
                onValueChange={(val) => val && setFilterPlan(val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free Trial</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(val) => val && setFilterStatus(val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Organization / Business</th>
                    <th className="px-4 py-3 font-semibold">Owner Email</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined Date</th>
                    <th className="px-4 py-3 text-right font-semibold">A to Z Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrganizations.map((org) => {
                    const isSuspended = org.subscription_status === "suspended";
                    return (
                      <tr
                        key={org.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{org.name}</p>
                              <p className="text-xs text-muted-foreground">
                                @{org.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {org.owner_email || "No Owner"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="capitalize font-semibold text-xs border-amber-500/30 bg-amber-500/5 text-amber-600"
                          >
                            {org.plan}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "font-semibold text-xs capitalize",
                              isSuspended
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                          >
                            {org.subscription_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(org.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleImpersonate(org)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Manage Workspace
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPlanModal(org)}
                            className="text-xs font-medium"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Change Plan
                          </Button>
                          <Button
                            size="sm"
                            variant={isSuspended ? "default" : "destructive"}
                            onClick={() => handleToggleSuspend(org)}
                            className="text-xs font-medium"
                          >
                            {isSuspended ? "Reactivate" : "Suspend"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrganizations.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No organizations found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PLANS & PRICING TAB */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Dynamic Subscription Plans & Quotas</h2>
              <p className="text-sm text-muted-foreground">
                Edit prices in BDT (৳) & USD ($), message quotas, contact limits, and feature bullets. Changes reflect instantly on pricing tables and customer accounts.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col justify-between border-2 transition-all hover:shadow-lg",
                  plan.is_popular
                    ? "border-amber-500 shadow-md"
                    : "border-border"
                )}
              >
                <div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="uppercase text-xs font-bold">
                        {plan.id}
                      </Badge>
                      {plan.is_popular && (
                        <Badge className="bg-amber-500 text-white text-[10px]">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold mt-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-extrabold text-foreground">
                        ৳{plan.price_bdt.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / mo (${plan.price_usd})
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Messages:</span>
                        <span className="font-semibold">{plan.message_limit_label}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Contacts:</span>
                        <span className="font-semibold">{plan.contact_limit_label}</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                      Features Included:
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="pt-4 border-t border-border">
                  <Button
                    onClick={() => handleOpenPlanEditor(plan)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Plan & Price
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CHANGE PLAN MODAL */}
      <Dialog open={orgPlanModalOpen} onOpenChange={setOrgPlanModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Organization Plan</DialogTitle>
            <DialogDescription>
              Modify subscription tier and active status for{" "}
              <strong>{selectedOrg?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Tier</label>
              <Select
                value={newPlan}
                onValueChange={(val) => val && setNewPlan(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Trial (৳0)</SelectItem>
                  <SelectItem value="starter">Starter (৳1,999)</SelectItem>
                  <SelectItem value="pro">Pro (৳4,999)</SelectItem>
                  <SelectItem value="business">Business Suite (৳9,999)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Status</label>
              <Select
                value={newStatus}
                onValueChange={(val) => val && setNewStatus(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOrgPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrganization}
              disabled={updatingOrg}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              {updatingOrg ? "Updating..." : "Save Overrides"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PLAN & PRICING MODAL */}
      <Dialog open={planEditModalOpen} onOpenChange={setPlanEditModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan: {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Changes to pricing and quotas apply immediately across the system.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Plan Name</label>
                  <Input
                    value={selectedPlan.name}
                    onChange={(e) =>
                      setSelectedPlan({ ...selectedPlan, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Plan Identifier (ID)</label>
                  <Input value={selectedPlan.id} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Monthly Price BDT (৳)</label>
                  <Input
                    type="number"
                    value={selectedPlan.price_bdt}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        price_bdt: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Monthly Price USD ($)</label>
                  <Input
                    type="number"
                    value={selectedPlan.price_usd}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        price_usd: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Message Quota Number</label>
                  <Input
                    type="number"
                    value={selectedPlan.message_quota}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        message_quota: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Message Limit Display Label</label>
                  <Input
                    value={selectedPlan.message_limit_label}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        message_limit_label: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Contact Limit Number</label>
                  <Input
                    type="number"
                    value={selectedPlan.contact_limit}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        contact_limit: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Contact Limit Display Label</label>
                  <Input
                    value={selectedPlan.contact_limit_label}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        contact_limit_label: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold">
                  Features Included (One feature per line)
                </label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedPlan.features.join("\n")}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      features: e.target.value
                        .split("\n")
                        .filter((line) => line.trim() !== ""),
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pop_checkbox"
                    checked={selectedPlan.is_popular}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        is_popular: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="pop_checkbox" className="text-sm font-medium">
                    Mark as "Popular" badge on pricing page
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPlanEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={savingPlan}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {savingPlan ? "Saving..." : "Save Plan Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
