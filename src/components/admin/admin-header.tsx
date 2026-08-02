"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Platform Overview & MRR Analytics";
    if (pathname.includes("/admin/organizations"))
      return "Customer Organizations & Tenant Workspace Control";
    if (pathname.includes("/admin/users"))
      return "Platform Users & Administrator Roles";
    if (pathname.includes("/admin/plans"))
      return "Dynamic SaaS Plans & Quota Editor";
    if (pathname.includes("/admin/system"))
      return "WhatsApp Provider Health & System Configuration";
    return "SaaS Master Control Portal";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-foreground tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold border-amber-500/40 text-amber-600 bg-amber-500/5 px-2 py-0"
            >
              <Crown className="h-2.5 w-2.5 mr-1 text-amber-500" />
              SaaS Level 0 Control
            </Badge>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 text-xs font-semibold"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Go to User CRM Portal
          </Button>
        </Link>
      </div>
    </header>
  );
}
