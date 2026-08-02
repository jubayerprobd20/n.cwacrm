// ============================================================
// WASender API Instance Management API (/api/whatsapp/wasender)
// GET: Fetches WASender session status and QR code
// POST: Connects/saves WASender session config to DB
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWASenderStatus, getWASenderQrCode } from '@/lib/whatsapp/wasender-client';

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

    const { data: configs, error: configErr } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .eq('provider', 'wasender')
      .limit(1);

    const config = configs?.[0];

    if (configErr || !config || config.provider !== 'wasender') {
      return NextResponse.json(
        { connected: false, status: 'disconnected', message: 'WASender API not configured' },
        { status: 200 }
      );
    }

    if (!config.wasender_base_url || !config.wasender_api_key) {
      return NextResponse.json(
        { connected: false, status: 'disconnected', message: 'Incomplete WASender credentials' },
        { status: 200 }
      );
    }

    const waConfig = {
      baseUrl: config.wasender_base_url,
      apiKey: config.wasender_api_key,
      deviceId: config.wasender_device_id,
    };

    const statusRes = await getWASenderStatus(waConfig);
    const isConnected = statusRes.success && statusRes.status === 'CONNECTED';
    const statusStr = isConnected ? 'connected' : (statusRes.status?.toLowerCase() || 'disconnected');

    let qrcode = null;
    if (!isConnected) {
      const qrRes = await getWASenderQrCode(waConfig);
      if (qrRes.success && qrRes.qr) {
        qrcode = qrRes.qr;
      }
    }

    await supabase
      .from('whatsapp_config')
      .update({
        wasender_status: statusStr,
        status: isConnected ? 'connected' : 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    return NextResponse.json({
      connected: isConnected,
      status: statusStr,
      qrcode,
    });
  } catch (err) {
    console.error('[wasender-api GET] Error:', err);
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
    const { baseUrl, apiKey, deviceId } = body;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'baseUrl and apiKey are required' },
        { status: 400 }
      );
    }

    const waConfig = {
      baseUrl,
      apiKey,
      deviceId,
    };

    const statusRes = await getWASenderStatus(waConfig);
    if (!statusRes.success && statusRes.error) {
      return NextResponse.json(
        { error: `WASender API Error: ${statusRes.error}` },
        { status: 400 }
      );
    }

    const isConnected = statusRes.status === 'CONNECTED';
    const statusStr = isConnected ? 'connected' : 'disconnected';

    let qrcode = null;
    if (!isConnected) {
      const qrRes = await getWASenderQrCode(waConfig);
      if (qrRes.success && qrRes.qr) {
        qrcode = qrRes.qr;
      }
    }

    const { data: existingRows } = await supabase
      .from('whatsapp_config')
      .select('id')
      .eq('account_id', accountId)
      .limit(1);

    const existingRow = existingRows?.[0];

    const configPayload = {
      provider: 'wasender',
      wasender_base_url: baseUrl,
      wasender_api_key: apiKey,
      wasender_device_id: deviceId || '',
      wasender_status: statusStr,
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
      status: statusStr,
      qrcode,
    });
  } catch (err) {
    console.error('[wasender-api POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
