"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Edit,
  CheckCircle,
  RefreshCw,
  Sparkles,
  DollarSign,
  Zap,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SaasPlan | null>(null);
  const [planEditModalOpen, setPlanEditModalOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error("[AdminPlans] Error:", err);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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

      toast.success(`Successfully updated plan: ${selectedPlan.name}`);
      setPlanEditModalOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      toast.error("Failed to save plan changes");
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading SaaS Plans & Pricing Tiers...
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
            Dynamic SaaS Subscription Plans & Quota Editor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure monthly BDT (৳) & USD ($) pricing, broadcast message limits, and CRM contact quotas. Updates reflect immediately across the entire platform.
          </p>
        </div>
        <Button onClick={fetchPlans} variant="outline" className="shrink-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Tiers
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col justify-between border-2 transition-all hover:shadow-lg",
              plan.is_popular
                ? "border-amber-500 shadow-md bg-gradient-to-b from-amber-500/[0.03] to-transparent"
                : "border-border bg-card"
            )}
          >
            <div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="uppercase text-xs font-bold border-primary/30 text-primary"
                  >
                    {plan.id}
                  </Badge>
                  {plan.is_popular && (
                    <Badge className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-extrabold mt-2">
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
                <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="font-bold">{plan.message_limit_label}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Contacts:</span>
                    <span className="font-bold">{plan.contact_limit_label}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">
                  Features Included:
                </p>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <CardFooter className="pt-4 border-t border-border">
              <Button
                onClick={() => handleOpenPlanEditor(plan)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan & Quotas
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* EDIT PLAN & PRICING MODAL */}
      <Dialog open={planEditModalOpen} onOpenChange={setPlanEditModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Subscription Plan: {selectedPlan?.name}
            </DialogTitle>
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
                  <label className="text-xs font-semibold">
                    Plan Identifier (ID)
                  </label>
                  <Input
                    value={selectedPlan.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Monthly Price BDT (৳)
                  </label>
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
                  <label className="text-xs font-semibold">
                    Monthly Price USD ($)
                  </label>
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
                  <label className="text-xs font-semibold">
                    Message Quota Number
                  </label>
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
                  <label className="text-xs font-semibold">
                    Message Limit Display Label
                  </label>
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
                  <label className="text-xs font-semibold">
                    Contact Limit Number
                  </label>
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
                  <label className="text-xs font-semibold">
                    Contact Limit Display Label
                  </label>
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
                    Mark as &quot;Popular&quot; badge on pricing page
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
