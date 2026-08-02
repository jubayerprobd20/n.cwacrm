// ============================================================
// WASender API Webhook Endpoint (/api/whatsapp/wasender-webhook)
// Receives incoming messages and device status changes from
// WASender API and routes them into the shared WhatsApp message
// processing pipeline.
// ============================================================

import { NextResponse, after } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processInboundWhatsAppMessage } from '@/lib/whatsapp/inbound-handler';

export const maxDuration = 60;

// Lazy-initialized admin client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null;
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  after(async () => {
    try {
      await processWASenderWebhook(body);
    } catch (error) {
      console.error('[wasender-webhook] Error processing webhook:', error);
    }
  });

  return NextResponse.json({ status: 'received' }, { status: 200 });
}

async function processWASenderWebhook(body: Record<string, unknown>) {
  const deviceId = String(body.device_id || body.deviceId || '');

  // If no deviceId, try finding any active WASender config if there's only one
  let configRow = null;
  if (deviceId) {
    const { data } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('*')
      .eq('provider', 'wasender')
      .eq('wasender_device_id', deviceId)
      .maybeSingle();
    configRow = data;
  } else {
    const { data } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('*')
      .eq('provider', 'wasender')
      .limit(1)
      .maybeSingle();
    configRow = data;
  }

  if (!configRow) {
    console.warn('[wasender-webhook] No WASender config found for incoming webhook');
    return;
  }

  const event = String(body.event || body.type || 'message').toLowerCase();

  // Status update
  if (event === 'status' || event === 'connection_change') {
    const status = String(body.status || 'disconnected').toLowerCase();
    await supabaseAdmin()
      .from('whatsapp_config')
      .update({
        wasender_status: status,
        status: status === 'connected' ? 'connected' : 'disconnected',
      })
      .eq('id', configRow.id);
    return;
  }

  // Incoming message
  const senderPhone = String(body.phone || body.from || '').replace(/\D/g, '');
  if (!senderPhone) return;

  const contactName = String(body.name || body.push_name || senderPhone);
  const messageId = String(body.message_id || body.id || `wasender-${Date.now()}`);
  const timestamp = body.timestamp as string | number | undefined;

  const text = typeof body.message === 'string' ? body.message : (body.text as string) || null;
  const mediaUrl = (body.media_url as string) || (body.url as string) || null;
  let messageType = 'text';

  if (mediaUrl) {
    const mt = String(body.media_type || '').toLowerCase();
    if (mt.includes('image')) messageType = 'image';
    else if (mt.includes('video')) messageType = 'video';
    else if (mt.includes('audio')) messageType = 'audio';
    else messageType = 'document';
  }

  await processInboundWhatsAppMessage({
    accountId: configRow.account_id,
    configOwnerUserId: configRow.user_id,
    senderPhone,
    contactName,
    messageId,
    messageType,
    contentText: text,
    mediaUrl,
    timestamp,
  });
}
