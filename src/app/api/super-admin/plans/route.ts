import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { supabaseAdmin } from "@/lib/automations/admin-client";

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price_bdt: 0,
    price_usd: 0,
    message_quota: 100,
    contact_limit: 50,
    message_limit_label: "100 / mo",
    contact_limit_label: "50 contacts",
    features: [
      "1 WhatsApp number session",
      "50 Contacts limit",
      "Standard Support",
      "Basic Broadcasts",
    ],
    unlimited: false,
    is_popular: false,
    is_active: true,
  },
  {
    id: "starter",
    name: "Starter",
    price_bdt: 1999,
    price_usd: 19,
    message_quota: 5000,
    contact_limit: 1000,
    message_limit_label: "5,000 / mo",
    contact_limit_label: "1,000 contacts",
    features: [
      "1 WhatsApp number session",
      "1,000 Contacts limit",
      "Shared Inbox (Up to 3 agents)",
      "Basic Auto-Responder",
      "Scheduled broadcasts",
    ],
    unlimited: false,
    is_popular: false,
    is_active: true,
  },
  {
    id: "pro",
    name: "Pro",
    price_bdt: 4999,
    price_usd: 49,
    message_quota: 50000,
    contact_limit: 10000,
    message_limit_label: "50,000 / mo",
    contact_limit_label: "10,000 contacts",
    features: [
      "3 WhatsApp number sessions",
      "10,000 Contacts limit",
      "Unlimited Inbox Agents",
      "No-code Chatbot Flow Builder",
      "AI Reply Assistant (BYO Key)",
      "Priority email/chat support",
    ],
    unlimited: false,
    is_popular: true,
    is_active: true,
  },
  {
    id: "business",
    name: "Business Suite",
    price_bdt: 9999,
    price_usd: 99,
    message_quota: 9999999,
    contact_limit: 9999999,
    message_limit_label: "Unlimited",
    contact_limit_label: "Unlimited contacts",
    features: [
      "Unlimited WhatsApp numbers",
      "Unlimited Contacts & Uploads",
      "White-label portal options",
      "Custom domain mapping",
      "School/ERP & InvoBill connect",
      "24/7 Dedicated account manager",
    ],
    unlimited: true,
    is_popular: false,
    is_active: true,
  },
];

export async function GET() {
  const admin = supabaseAdmin();

  try {
    const { data: plans, error } = await admin
      .from("saas_subscription_plans")
      .select("*")
      .order("price_bdt", { ascending: true });

    if (error || !plans || plans.length === 0) {
      return NextResponse.json({ plans: DEFAULT_PLANS });
    }

    return NextResponse.json({ plans });
  } catch (err: any) {
    console.error("[SuperAdmin Plans] GET error:", err);
    return NextResponse.json({ plans: DEFAULT_PLANS });
  }
}

export async function PUT(request: Request) {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized) return authRes.response;

  const admin = authRes.adminClient;

  try {
    const body = await request.json();
    const {
      id,
      name,
      price_bdt,
      price_usd,
      message_quota,
      contact_limit,
      message_limit_label,
      contact_limit_label,
      features,
      unlimited,
      is_popular,
      is_active,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Plan ID and name are required" },
        { status: 400 }
      );
    }

    const payload = {
      id,
      name,
      price_bdt: Number(price_bdt) || 0,
      price_usd: Number(price_usd) || 0,
      message_quota: Number(message_quota) || 1000,
      contact_limit: Number(contact_limit) || 500,
      message_limit_label: message_limit_label || "1,000 / mo",
      contact_limit_label: contact_limit_label || "500 contacts",
      features: Array.isArray(features) ? features : [],
      unlimited: Boolean(unlimited),
      is_popular: Boolean(is_popular),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("saas_subscription_plans")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("[SuperAdmin Plans] PUT error:", error);
      return NextResponse.json(
        { error: "Failed to save plan: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: data });
  } catch (err: any) {
    console.error("[SuperAdmin Plans] PUT threw:", err);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
