// ============================================================
// Evolution API Instance Management API (/api/whatsapp/evolution)
// GET: Fetches live connection status and QR code
// POST: Creates/connects an instance and saves config to DB
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createEvolutionInstance,
  getEvolutionConnectionState,
  getEvolutionQrCode,
  logoutEvolutionInstance,
  setEvolutionWebhook,
} from '@/lib/whatsapp/evolution-client';
import { getEvolutionApiUrl, getEvolutionApiKey } from '@/lib/supabase/env-utils';

async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data?.account_id) return null;
  return data.account_id as string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = await resolveAccountId(supabase, user.id);
    if (!accountId) {
      return NextResponse.json({ error: 'No account linked' }, { status: 403 });
    }

    const { data: config, error: configErr } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    const evoBaseUrl = getEvolutionApiUrl(config?.evolution_base_url);
    const evoApiKey = getEvolutionApiKey(config?.evolution_api_key);
    const evoInstanceName = (config?.evolution_instance_name || 'wacrm-instance').trim();

    if (!evoBaseUrl || !evoApiKey || !evoInstanceName) {
      return NextResponse.json(
        { connected: false, status: 'disconnected', message: 'Incomplete Evolution API credentials' },
        { status: 200 }
      );
    }

    const evoConfig = {
      baseUrl: evoBaseUrl,
      apiKey: evoApiKey,
      instanceName: evoInstanceName,
    };

    const stateRes = await getEvolutionConnectionState(evoConfig);
    const state =
      stateRes.instance?.state || stateRes.state || 'disconnected';
    const isConnected = state.toLowerCase() === 'open' || state.toLowerCase() === 'connected';

    // Construct live webhook URL using request host header so production domain is always used
    const host = request.headers.get('host') || 'wacrm.nextcorebd.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const webhookUrl = `${publicAppUrl.replace(/\/+$/, '')}/api/whatsapp/evolution-webhook`;

    // Ensure webhook is registered whenever instance is connected
    if (isConnected) {
      setEvolutionWebhook(evoConfig, webhookUrl).catch((err) => {
        console.warn('[evolution-api GET] Background webhook registration warning:', err);
      });
    }

    let qrcode = null;
    if (!isConnected) {
      const qrRes = await getEvolutionQrCode(evoConfig);
      if (qrRes.base64 || qrRes.code) {
        qrcode = qrRes;
      }
    }

    // Sync status in database if config row exists
    if (config?.id) {
      await supabase
        .from('whatsapp_config')
        .update({
          evolution_instance_status: isConnected ? 'open' : state.toLowerCase(),
          status: isConnected ? 'connected' : 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);
    }

    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? 'open' : state.toLowerCase(),
      qrcode,
      instanceName: evoInstanceName,
    });
  } catch (err) {
    console.error('[evolution-api GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = await resolveAccountId(supabase, user.id);
    if (!accountId) {
      return NextResponse.json({ error: 'No account linked' }, { status: 403 });
    }

    const body = await request.json();
    let { action, baseUrl, apiKey, instanceName } = body;

    // Use server environment variables or NextCore fallback when user opts for Hosted/Default server
    baseUrl = getEvolutionApiUrl(baseUrl);
    apiKey = getEvolutionApiKey(apiKey);

    if (!baseUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: 'Evolution Server URL, API Key, and Instance Name are required' },
        { status: 400 }
      );
    }

    const cleanInstanceName = (instanceName || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '') || 'wacrm-instance';

    const evoConfig = {
      baseUrl,
      apiKey,
      instanceName: cleanInstanceName,
    };

    if (action === 'logout') {
      await logoutEvolutionInstance(evoConfig);
      await supabase
        .from('whatsapp_config')
        .update({
          evolution_instance_status: 'disconnected',
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId);

      return NextResponse.json({ success: true, status: 'disconnected' });
    }

    // Construct live webhook URL using request host header
    const host = request.headers.get('host') || 'wacrm.nextcorebd.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const webhookUrl = `${publicAppUrl.replace(/\/+$/, '')}/api/whatsapp/evolution-webhook`;

    // Try creating instance first
    const createRes = await createEvolutionInstance(evoConfig, webhookUrl);
    let qrcode = createRes.qrcode;
    let state = 'connecting';

    // Register webhook asynchronously in background (compatible with Evolution API v1 & v2)
    setEvolutionWebhook(evoConfig, webhookUrl).catch((err) => {
      console.warn('[evolution-api POST] Background webhook registration warning:', err);
    });

    if (!createRes.success && createRes.error?.toLowerCase().includes('already exists')) {
      // Instance already exists, check its state
      const stateRes = await getEvolutionConnectionState(evoConfig);
      state = stateRes.instance?.state || stateRes.state || 'disconnected';
      if (state.toLowerCase() !== 'open') {
        const qrRes = await getEvolutionQrCode(evoConfig);
        if (qrRes.base64 || qrRes.code) {
          qrcode = qrRes;
        }
      }
    } else if (!createRes.success && createRes.error) {
      return NextResponse.json(
        { error: `Evolution API Error: ${createRes.error}` },
        { status: 400 }
      );
    }

    const isConnected = state.toLowerCase() === 'open';

    // Check if existing config row exists
    const { data: existingRow } = await supabase
      .from('whatsapp_config')
      .select('id')
      .eq('account_id', accountId)
      .maybeSingle();

    const configPayload = {
      provider: 'evolution',
      evolution_base_url: baseUrl,
      evolution_api_key: apiKey,
      evolution_instance_name: cleanInstanceName,
      evolution_instance_status: state.toLowerCase(),
      status: isConnected ? 'connected' : 'disconnected',
      updated_at: new Date().toISOString(),
    };

    if (existingRow) {
      await supabase
        .from('whatsapp_config')
        .update(configPayload)
        .eq('account_id', accountId);
    } else {
      await supabase.from('whatsapp_config').insert({
        account_id: accountId,
        user_id: user.id,
        ...configPayload,
      });
    }

    return NextResponse.json({
      success: true,
      connected: isConnected,
      status: state.toLowerCase(),
      qrcode,
      instanceName: cleanInstanceName,
    });
  } catch (err) {
    console.error('[evolution-api POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
