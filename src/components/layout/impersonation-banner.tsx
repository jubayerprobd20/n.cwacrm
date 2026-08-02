"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedOrgName, impersonateOrganization } =
    useAuth();
  const router = useRouter();

  if (!isImpersonating) return null;

  const handleExit = () => {
    impersonateOrganization(null);
    toast.success("Exited customer workspace impersonation mode");
    router.push("/super-admin");
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 animate-pulse">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>
          <strong>Super Admin Mode:</strong> You are currently impersonating and setting up workspace:{" "}
          <span className="underline decoration-white/60 font-bold">
            {impersonatedOrgName || "Customer Account"}
          </span>
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleExit}
        className="bg-white text-orange-900 hover:bg-orange-50 font-semibold h-7 text-xs flex items-center gap-1 shadow-sm"
      >
        <LogOut className="h-3.5 w-3.5" />
        Exit to Super Admin
      </Button>
    </div>
  );
}
