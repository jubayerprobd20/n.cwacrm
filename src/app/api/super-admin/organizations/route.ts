import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export async function GET() {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized) return authRes.response;

  const admin = authRes.adminClient;

  try {
    const { data: orgs, error: orgsErr } = await admin
      .from("organizations")
      .select("id, name, slug, plan, subscription_status, created_at")
      .order("created_at", { ascending: false });

    if (orgsErr) {
      console.error("[SuperAdmin Orgs] Error fetching organizations:", orgsErr);
      return NextResponse.json({ organizations: [] });
    }

    // Fetch owners/members for each organization to display email & role
    const orgIds = (orgs || []).map((o) => o.id);
    const { data: userOrgs } = await admin
      .from("user_organizations")
      .select("user_id, organization_id, role")
      .in("organization_id", orgIds)
      .eq("role", "owner");

    const ownerUserIds = (userOrgs || []).map((uo) => uo.user_id);
    const { data: profiles } = await admin
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", ownerUserIds);

    const emailMap = new Map<string, { email: string; full_name: string | null }>();
    profiles?.forEach((p) => {
      emailMap.set(p.user_id, {
        email: p.email,
        full_name: p.full_name,
      });
    });

    const orgOwnerMap = new Map<string, { email: string; full_name: string | null }>();
    userOrgs?.forEach((uo) => {
      const p = emailMap.get(uo.user_id);
      if (p) {
        orgOwnerMap.set(uo.organization_id, p);
      }
    });

    const enriched = (orgs || []).map((org) => {
      const owner = orgOwnerMap.get(org.id);
      return {
        ...org,
        owner_email: owner?.email || "No Owner",
        owner_name: owner?.full_name || "Unknown",
      };
    });

    return NextResponse.json({ organizations: enriched });
  } catch (err: any) {
    console.error("[SuperAdmin Orgs] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load organizations" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized) return authRes.response;

  const admin = authRes.adminClient;

  try {
    const body = await request.json();
    const { id, plan, subscription_status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};
    if (plan !== undefined) updatePayload.plan = plan;
    if (subscription_status !== undefined) {
      updatePayload.subscription_status = subscription_status;
    }

    const { data, error } = await admin
      .from("organizations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[SuperAdmin Orgs] PATCH error:", error);
      return NextResponse.json(
        { error: "Failed to update organization: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ organization: data });
  } catch (err: any) {
    console.error("[SuperAdmin Orgs] PATCH threw:", err);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
