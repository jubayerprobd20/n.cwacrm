-- ============================================================
-- Migration 045: Multi-provider WhatsApp Support
-- Adds support for Evolution API and WASender API
-- ============================================================

-- Allow nullable phone_number_id and access_token for non-Meta providers
ALTER TABLE whatsapp_config
  ALTER COLUMN phone_number_id DROP NOT NULL,
  ALTER COLUMN access_token DROP NOT NULL;

-- Add provider type and credentials for Evolution API and WASender API
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'meta' CHECK (provider IN ('meta', 'evolution', 'wasender')),
  ADD COLUMN IF NOT EXISTS evolution_base_url TEXT,
  ADD COLUMN IF NOT EXISTS evolution_api_key TEXT,
  ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT,
  ADD COLUMN IF NOT EXISTS evolution_instance_status TEXT DEFAULT 'disconnected',
  ADD COLUMN IF NOT EXISTS wasender_base_url TEXT,
  ADD COLUMN IF NOT EXISTS wasender_api_key TEXT,
  ADD COLUMN IF NOT EXISTS wasender_device_id TEXT,
  ADD COLUMN IF NOT EXISTS wasender_status TEXT DEFAULT 'disconnected';
