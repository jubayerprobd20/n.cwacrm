import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export async function GET() {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized) return authRes.response;

  const admin = authRes.adminClient;

  try {
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, user_id, email, full_name, role, is_super_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SuperAdmin Users] Error:", error);
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json({ users: profiles || [] });
  } catch (err: unknown) {
    console.error("[SuperAdmin Users] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load users" },
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
    const { email, is_super_admin } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Target email is required" },
        { status: 400 }
      );
    }

    const { error } = await admin.rpc("set_super_admin", {
      target_email: email,
      status: Boolean(is_super_admin),
    });

    if (error) {
      console.error("[SuperAdmin Users] RPC set_super_admin error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update super admin status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, email, is_super_admin });
  } catch (err: unknown) {
    console.error("[SuperAdmin Users] PATCH threw:", err);
    return NextResponse.json(
      { error: "Failed to modify administrator role" },
      { status: 500 }
    );
  }
}
