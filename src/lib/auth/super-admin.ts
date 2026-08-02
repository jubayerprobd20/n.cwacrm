import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { NextResponse } from "next/server";

const SUPER_ADMIN_EMAILS = [
  "nextcorebd@gmail.com",
  "jubayerprobd@gmail.com",
  "admin@nextcorebd.com",
];

export async function isUserSuperAdmin(userId: string): Promise<boolean> {
  try {
    const admin = supabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, is_super_admin")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) return false;

    if (profile.is_super_admin === true) return true;
    if (profile.email && SUPER_ADMIN_EMAILS.includes(profile.email.toLowerCase())) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("[isUserSuperAdmin] Error check:", err);
    return false;
  }
}

export type RequireSuperAdminResult =
  | { authorized: false; response: NextResponse }
  | { authorized: true; user: unknown; adminClient: ReturnType<typeof supabaseAdmin> };

export async function requireSuperAdmin(): Promise<RequireSuperAdminResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const superAdmin = await isUserSuperAdmin(session.user.id);
  if (!superAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden: Require Super Admin access" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: session.user,
    adminClient: supabaseAdmin(),
  };
}
