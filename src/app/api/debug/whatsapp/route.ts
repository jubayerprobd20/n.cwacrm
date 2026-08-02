// ============================================================
// DEBUG ENDPOINT: /api/debug/whatsapp
// Shows real DB state, Evolution API status, webhook registration
// REMOVE in production or protect with admin check
// ============================================================
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEvolutionApiUrl, getEvolutionApiKey } from '@/lib/supabase/env-utils';

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1);
    const accountId = profile?.[0]?.account_id;

    // Get ALL config rows for this account
    const { data: allConfigs, error: dbErr } = await supabase
      .from('whatsapp_config')
      .select('id, provider, evolution_instance_name, evolution_instance_status, status, evolution_base_url, updated_at')
      .eq('account_id', accountId as string);

    const config = allConfigs?.[0];
    const evoBaseUrl = getEvolutionApiUrl(config?.evolution_base_url);
    const evoApiKey = getEvolutionApiKey(null);
    const evoInstanceName = config?.evolution_instance_name || 'wacrm-instance';

    // Live check Evolution API
    let evolutionLiveState: unknown = null;
    let evolutionError: string | null = null;
    let webhookInfo: unknown = null;
    let webhookError: string | null = null;

    try {
      const stateRes = await fetch(
        `${evoBaseUrl}/instance/connectionState/${evoInstanceName}`,
        { headers: { apikey: evoApiKey }, signal: AbortSignal.timeout(8000) }
      );
      evolutionLiveState = await stateRes.json();
    } catch (e) {
      evolutionError = e instanceof Error ? e.message : String(e);
    }

    // Check registered webhook
    try {
      const webhookRes = await fetch(
        `${evoBaseUrl}/webhook/find/${evoInstanceName}`,
        { headers: { apikey: evoApiKey }, signal: AbortSignal.timeout(8000) }
      );
      webhookInfo = await webhookRes.json();
    } catch (e) {
      webhookError = e instanceof Error ? e.message : String(e);
    }

    const host = request.headers.get('host') || 'wacrm.nextcorebd.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const expectedWebhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`}/api/whatsapp/evolution-webhook`;

    return NextResponse.json({
      user_id: user.id,
      account_id: accountId,
      db: {
        total_config_rows: allConfigs?.length ?? 0,
        rows: allConfigs,
        db_error: dbErr?.message,
      },
      evolution: {
        base_url: evoBaseUrl,
        instance_name: evoInstanceName,
        live_state: evolutionLiveState,
        live_error: evolutionError,
        reachable: !evolutionError,
      },
      webhook: {
        expected_url: expectedWebhookUrl,
        registered: webhookInfo,
        error: webhookError,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
