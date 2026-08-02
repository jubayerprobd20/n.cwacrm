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
} from '@/lib/whatsapp/evolution-client';

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

export async function GET() {
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

    if (configErr || !config || config.provider !== 'evolution') {
      return NextResponse.json(
        { connected: false, status: 'disconnected', message: 'Evolution API not configured' },
        { status: 200 }
      );
    }

    if (!config.evolution_base_url || !config.evolution_api_key || !config.evolution_instance_name) {
      return NextResponse.json(
        { connected: false, status: 'disconnected', message: 'Incomplete Evolution API credentials' },
        { status: 200 }
      );
    }

    const evoConfig = {
      baseUrl: config.evolution_base_url,
      apiKey: config.evolution_api_key,
      instanceName: config.evolution_instance_name,
    };

    const stateRes = await getEvolutionConnectionState(evoConfig);
    const state =
      stateRes.instance?.state || stateRes.state || 'disconnected';
    const isConnected = state.toLowerCase() === 'open';

    let qrcode = null;
    if (!isConnected) {
      const qrRes = await getEvolutionQrCode(evoConfig);
      if (qrRes.base64 || qrRes.code) {
        qrcode = qrRes;
      }
    }

    // Sync status in database
    await supabase
      .from('whatsapp_config')
      .update({
        evolution_instance_status: state.toLowerCase(),
        status: isConnected ? 'connected' : 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    return NextResponse.json({
      connected: isConnected,
      status: state.toLowerCase(),
      qrcode,
      instanceName: config.evolution_instance_name,
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
    const { action, baseUrl, apiKey, instanceName } = body;

    if (!baseUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: 'baseUrl, apiKey, and instanceName are required' },
        { status: 400 }
      );
    }

    const evoConfig = {
      baseUrl,
      apiKey,
      instanceName,
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

    // Construct public webhook URL
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wacrm.jubayer.pro';
    const webhookUrl = `${publicAppUrl.replace(/\/+$/, '')}/api/whatsapp/evolution-webhook`;

    // Try creating instance first
    const createRes = await createEvolutionInstance(evoConfig, webhookUrl);
    let qrcode = createRes.qrcode;
    let state = 'connecting';

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
      evolution_instance_name: instanceName,
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
      instanceName,
    });
  } catch (err) {
    console.error('[evolution-api POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
