-- ============================================================
-- 043_account_type_reseller.sql
-- Adds two-tier account type system (user / reseller) and
-- the supporting tables for the Reseller Program.
-- ============================================================

-- 1. account_type on organizations
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'user'
    CHECK (account_type IN ('user', 'reseller'));

-- 2. reseller_settings — white-label branding + AM details
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reseller_settings (
  organization_id  UUID PRIMARY KEY
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  brand_name        TEXT,
  brand_logo_url    TEXT,
  accent_color      TEXT NOT NULL DEFAULT '#25D366',
  support_email     TEXT,
  support_phone     TEXT,
  custom_domain     TEXT,
  -- Assigned account manager (set by platform admin)
  manager_name      TEXT,
  manager_email     TEXT,
  -- % markup applied on top of platform credit costs
  credit_margin_pct NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (credit_margin_pct >= 0 AND credit_margin_pct <= 100),
  -- Wallet balance available to distribute to clients
  wallet_balance    NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. reseller_clients — sub-accounts under a reseller
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reseller_clients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseller_org_id  UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_org_id    UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- Credit balance allocated to this client by the reseller
  credit_balance   NUMERIC(14,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended')),
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at      TIMESTAMPTZ,
  UNIQUE (reseller_org_id, client_org_id)
);

CREATE INDEX IF NOT EXISTS idx_reseller_clients_reseller
  ON public.reseller_clients(reseller_org_id);
CREATE INDEX IF NOT EXISTS idx_reseller_clients_client
  ON public.reseller_clients(client_org_id);

-- 4. reseller_invites — token-based invite links
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reseller_invites (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseller_org_id  UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  email            TEXT,  -- optional; pre-fills the signup form
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. credit_transactions — audit log for credit top-ups / usage
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  reseller_org_id  UUID
    REFERENCES public.organizations(id) ON DELETE SET NULL,
  type             TEXT NOT NULL
    CHECK (type IN ('topup', 'usage', 'adjustment', 'refund')),
  amount           NUMERIC(14,2) NOT NULL,  -- positive = credit, negative = debit
  currency         TEXT NOT NULL DEFAULT 'BDT',
  payment_reference TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_org
  ON public.credit_transactions(organization_id);

-- 6. RLS Policies
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.reseller_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_invites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- reseller_settings: readable + writable by org members (admin+)
CREATE POLICY "reseller_settings_select" ON public.reseller_settings
  FOR SELECT USING (
    public.is_organization_member(organization_id, 'viewer')
  );

CREATE POLICY "reseller_settings_upsert" ON public.reseller_settings
  FOR ALL USING (
    public.is_organization_member(organization_id, 'admin')
  );

-- reseller_clients: reseller org members can see their clients
CREATE POLICY "reseller_clients_select" ON public.reseller_clients
  FOR SELECT USING (
    public.is_organization_member(reseller_org_id, 'viewer')
  );

CREATE POLICY "reseller_clients_manage" ON public.reseller_clients
  FOR ALL USING (
    public.is_organization_member(reseller_org_id, 'admin')
  );

-- reseller_invites: reseller org members
CREATE POLICY "reseller_invites_select" ON public.reseller_invites
  FOR SELECT USING (
    public.is_organization_member(reseller_org_id, 'viewer')
  );

CREATE POLICY "reseller_invites_manage" ON public.reseller_invites
  FOR ALL USING (
    public.is_organization_member(reseller_org_id, 'admin')
  );

-- credit_transactions: org members can read their own transactions
CREATE POLICY "credit_transactions_select" ON public.credit_transactions
  FOR SELECT USING (
    public.is_organization_member(organization_id, 'viewer')
    OR public.is_organization_member(reseller_org_id, 'viewer')
  );
