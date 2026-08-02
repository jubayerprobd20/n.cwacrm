"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  LayoutDashboard,
  Building2,
  Users,
  Layers,
  Server,
  LogOut,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Overview & MRR",
    href: "/admin",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    title: "Customer Organizations",
    href: "/admin/organizations",
    icon: Building2,
    badge: "A to Z",
  },
  {
    title: "Platform Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Plans & Pricing Editor",
    href: "/admin/plans",
    icon: Layers,
  },
  {
    title: "System & Providers",
    href: "/admin/system",
    icon: Server,
    badge: "Health",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 bg-[#0B0F19] text-white border-r border-white/10 shrink-0 min-h-screen">
      {/* Top Brand Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/20">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-wide text-white">
              NEXTCORE
            </span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              SaaS
            </span>
          </div>
          <p className="text-[11px] font-medium text-amber-300/80 mt-0.5">
            Master Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Platform Management
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-amber-400" : "text-white/50 group-hover:text-white"
                  )}
                />
                <span>{item.title}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      isActive
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-white/10 text-white/60"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Security & Switch
        </div>
        <Link
          href="/dashboard"
          className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4 text-emerald-400 rotate-180" />
            <span>Return to User App</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3 rounded-lg p-2.5 bg-amber-500/10 border border-amber-500/20">
          <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xs">
            SA
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-amber-300 truncate">
              Super Admin Mode
            </p>
            <p className="text-[10px] text-white/60 truncate">
              Full Tenant & Plan Rights
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
