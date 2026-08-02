-- ============================================================
-- 046_saas_super_admin.sql — Master SaaS Super Admin & Plan Management
-- ============================================================

-- 1. Add is_super_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Create helper function to check Super Admin access
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  );
$$;

ALTER FUNCTION public.is_super_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

-- 3. Dynamic SaaS Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.saas_subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_bdt INTEGER NOT NULL DEFAULT 0,
  price_usd INTEGER NOT NULL DEFAULT 0,
  message_quota INTEGER NOT NULL DEFAULT 1000,
  contact_limit INTEGER NOT NULL DEFAULT 500,
  message_limit_label TEXT NOT NULL DEFAULT '1,000 / mo',
  contact_limit_label TEXT NOT NULL DEFAULT '500 contacts',
  features TEXT[] NOT NULL DEFAULT '{}',
  unlimited BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default plans if table is empty
INSERT INTO public.saas_subscription_plans (
  id, name, price_bdt, price_usd, message_quota, contact_limit,
  message_limit_label, contact_limit_label, features, unlimited, is_popular, is_active
)
VALUES
(
  'free', 'Free Trial', 0, 0, 100, 50,
  '100 / mo', '50 contacts',
  ARRAY[
    '1 WhatsApp number session',
    '50 Contacts limit',
    'Standard Support',
    'Basic Broadcasts'
  ],
  false, false, true
),
(
  'starter', 'Starter', 1999, 19, 5000, 1000,
  '5,000 / mo', '1,000 contacts',
  ARRAY[
    '1 WhatsApp number session',
    '1,000 Contacts limit',
    'Shared Inbox (Up to 3 agents)',
    'Basic Auto-Responder',
    'Scheduled broadcasts'
  ],
  false, false, true
),
(
  'pro', 'Pro', 4999, 49, 50000, 10000,
  '50,000 / mo', '10,000 contacts',
  ARRAY[
    '3 WhatsApp number sessions',
    '10,000 Contacts limit',
    'Unlimited Inbox Agents',
    'No-code Chatbot Flow Builder',
    'AI Reply Assistant (BYO Key)',
    'Priority email/chat support'
  ],
  false, true, true
),
(
  'business', 'Business Suite', 9999, 99, 9999999, 9999999,
  'Unlimited', 'Unlimited contacts',
  ARRAY[
    'Unlimited WhatsApp numbers',
    'Unlimited Contacts & Uploads',
    'White-label portal options',
    'Custom domain mapping',
    'School/ERP & InvoBill connect',
    '24/7 Dedicated account manager'
  ],
  true, false, true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_bdt = EXCLUDED.price_bdt,
  price_usd = EXCLUDED.price_usd,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 4. Enable RLS and add policies for Super Admin
ALTER TABLE public.saas_subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY saas_subscription_plans_select ON public.saas_subscription_plans
  FOR SELECT USING (true);

CREATE POLICY saas_subscription_plans_manage ON public.saas_subscription_plans
  FOR ALL USING (public.is_super_admin());

-- 5. Allow Super Admin to read and update ALL organizations and profiles
CREATE POLICY organizations_super_admin_select ON public.organizations
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY organizations_super_admin_update ON public.organizations
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY profiles_super_admin_select ON public.profiles
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY profiles_super_admin_update ON public.profiles
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY user_organizations_super_admin_select ON public.user_organizations
  FOR SELECT USING (public.is_super_admin());

-- 6. Helper RPC to promote an email to Super Admin
CREATE OR REPLACE FUNCTION public.set_super_admin(target_email TEXT, status BOOLEAN DEFAULT true)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow existing super admin OR service role to execute this
  IF NOT (public.is_super_admin() OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Unauthorized: Only super admin can grant super admin role';
  END IF;

  UPDATE public.profiles
  SET is_super_admin = status
  WHERE LOWER(email) = LOWER(target_email);

  RETURN FOUND;
END;
$$;

ALTER FUNCTION public.set_super_admin(TEXT, BOOLEAN) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.set_super_admin(TEXT, BOOLEAN) TO authenticated, service_role;
