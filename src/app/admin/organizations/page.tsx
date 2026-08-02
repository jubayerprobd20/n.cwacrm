"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Filter,
  ExternalLink,
  Edit,
  RefreshCw,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
}

export default function AdminOrganizationsPage() {
  const { impersonateOrganization } = useAuth();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgPlanModalOpen, setOrgPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState("free");
  const [newStatus, setNewStatus] = useState("active");
  const [updatingOrg, setUpdatingOrg] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error("[AdminOrgs] Error:", err);
      toast.error("Failed to load customer organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleImpersonate = (org: Organization) => {
    impersonateOrganization(org.id, org.name);
    toast.success(`Entering customer workspace: ${org.name}`);
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

      toast.success(
        `Updated ${selectedOrg.name} plan to ${newPlan.toUpperCase()}`
      );
      setOrgPlanModalOpen(false);
      fetchOrganizations();
    } catch (err: unknown) {
      toast.error("Failed to update organization");
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
        `Organization ${org.name} has been ${
          isSuspended ? "reactivated" : "suspended"
        }`
      );
      fetchOrganizations();
    } catch {
      toast.error("Action failed");
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.owner_email &&
        org.owner_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan =
      filterPlan === "all" ||
      org.plan.toLowerCase() === filterPlan.toLowerCase();

    const matchesStatus =
      filterStatus === "all" ||
      org.subscription_status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesPlan && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading SaaS Tenants & Workspaces...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Customer Organizations & Workspaces
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all SaaS customer accounts, switch into their workspace to troubleshoot or configure settings, and modify billing plans.
          </p>
        </div>
        <Button
          onClick={fetchOrganizations}
          variant="outline"
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Tenants
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name, slug, owner email..."
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free Trial</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="business">Business Suite</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(val) => val && setFilterStatus(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3.5 font-bold">Organization / Tenant</th>
                <th className="px-5 py-3.5 font-bold">Owner Email</th>
                <th className="px-5 py-3.5 font-bold">Plan</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold">Joined Date</th>
                <th className="px-5 py-3.5 text-right font-bold">
                  A to Z Actions
                </th>
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
                    <td className="px-5 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{org.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{org.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {org.owner_email || "No Owner Registered"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className="capitalize font-bold text-xs border-amber-500/30 bg-amber-500/5 text-amber-600 px-2.5 py-0.5"
                      >
                        {org.plan}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={cn(
                          "font-bold text-xs capitalize",
                          isSuspended
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        )}
                      >
                        {org.subscription_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleImpersonate(org)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Impersonate Workspace
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPlanModal(org)}
                        className="text-xs font-semibold"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Change Plan
                      </Button>
                      <Button
                        size="sm"
                        variant={isSuspended ? "default" : "destructive"}
                        onClick={() => handleToggleSuspend(org)}
                        className="text-xs font-semibold"
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
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    No customer organizations match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <label className="text-sm font-bold">Subscription Tier</label>
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
                  <SelectItem value="business">
                    Business Suite (৳9,999)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Account Status</label>
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
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {updatingOrg ? "Updating..." : "Save Overrides"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
