import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export async function GET() {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized) return authRes.response;

  const admin = authRes.adminClient;

  try {
    // 1. Total organizations
    const { data: orgs, error: orgsErr } = await admin
      .from("organizations")
      .select("id, plan, subscription_status, created_at");

    if (orgsErr) {
      // Fallback if organizations table not yet available
      return NextResponse.json({
        totalOrganizations: 0,
        totalPaidOrganizations: 0,
        totalMrrBdt: 0,
        totalMrrUsd: 0,
        totalContacts: 0,
        totalMessages: 0,
        planDistribution: { free: 0, starter: 0, pro: 0, business: 0 },
      });
    }

    const totalOrganizations = orgs?.length ?? 0;

    // 2. Fetch plans for pricing calculations
    let plansMap: Record<string, { price_bdt: number; price_usd: number }> = {
      free: { price_bdt: 0, price_usd: 0 },
      starter: { price_bdt: 1999, price_usd: 19 },
      pro: { price_bdt: 4999, price_usd: 49 },
      business: { price_bdt: 9999, price_usd: 99 },
    };

    const { data: plansData } = await admin
      .from("saas_subscription_plans")
      .select("id, price_bdt, price_usd");

    if (plansData && plansData.length > 0) {
      plansData.forEach((p) => {
        plansMap[p.id] = { price_bdt: p.price_bdt, price_usd: p.price_usd };
      });
    }

    let totalPaidOrganizations = 0;
    let totalMrrBdt = 0;
    let totalMrrUsd = 0;
    const planDistribution: Record<string, number> = {
      free: 0,
      starter: 0,
      pro: 0,
      business: 0,
    };

    orgs?.forEach((org) => {
      const planId = (org.plan || "free").toLowerCase();
      planDistribution[planId] = (planDistribution[planId] || 0) + 1;

      if (planId !== "free" && org.subscription_status === "active") {
        totalPaidOrganizations += 1;
        const rates = plansMap[planId] || { price_bdt: 0, price_usd: 0 };
        totalMrrBdt += rates.price_bdt;
        totalMrrUsd += rates.price_usd;
      }
    });

    // 3. Total Contacts & Messages
    const { count: totalContacts } = await admin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    const { count: totalMessages } = await admin
      .from("messages")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      totalOrganizations,
      totalPaidOrganizations,
      totalMrrBdt,
      totalMrrUsd,
      totalContacts: totalContacts ?? 0,
      totalMessages: totalMessages ?? 0,
      planDistribution,
    });
  } catch (err: any) {
    console.error("[SuperAdmin Stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to load platform stats" },
      { status: 500 }
    );
  }
}
