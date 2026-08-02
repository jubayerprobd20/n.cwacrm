import React from "react";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextCore SaaS Master Admin | Executive Portal",
  description: "Enterprise Level-0 Administration Portal for NextCore WhatsApp CRM",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRes = await requireSuperAdmin();

  if (!authRes.authorized) {
    // Regular users trying to access /admin are redirected to regular dashboard
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
