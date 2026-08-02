// ============================================================
// Evolution API Webhook Endpoint (/api/whatsapp/evolution-webhook)
// Receives MESSAGES_UPSERT and CONNECTION_UPDATE events from
// Evolution API v1 & v2 and routes them into the shared inbound
// WhatsApp message pipeline.
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
      await processEvolutionWebhook(body);
    } catch (error) {
      console.error('[evolution-webhook] Error processing webhook:', error);
    }
  });

  return NextResponse.json({ status: 'received' }, { status: 200 });
}

async function processEvolutionWebhook(body: Record<string, unknown>) {
  const event = String(body.event || body.type || '').toLowerCase();
  const instanceName = String(body.instance || body.instanceName || '');

  console.log(`[evolution-webhook] Received event: ${event} for instance: ${instanceName}`);

  if (!instanceName) {
    console.warn('[evolution-webhook] Missing instance name in payload');
    return;
  }

  // Find whatsapp_config by instance name first, then fallback to any evolution provider config
  let config: Record<string, unknown> | null = null;
  const { data: configs } = await supabaseAdmin()
    .from('whatsapp_config')
    .select('*')
    .eq('evolution_instance_name', instanceName)
    .limit(1);

  if (configs && configs.length > 0) {
    config = configs[0];
  } else {
    // Fallback: pick the first active Evolution configuration
    const { data: fallbackConfigs } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('*')
      .eq('provider', 'evolution')
      .limit(1);

    if (fallbackConfigs && fallbackConfigs.length > 0) {
      config = fallbackConfigs[0];
    }
  }

  if (!config) {
    console.warn(`[evolution-webhook] No whatsapp_config found for Evolution instance: ${instanceName}`);
    return;
  }

  // Handle connection state update
  if (
    event.includes('connection.update') ||
    event.includes('qrcode.updated') ||
    event.includes('connection_update') ||
    event.includes('status.update')
  ) {
    const stateObj = body.data as { state?: string; status?: string } | undefined;
    const state = stateObj?.state || stateObj?.status || 'disconnected';
    const isOpen = String(state).toLowerCase() === 'open' || String(state).toLowerCase() === 'connected';

    await supabaseAdmin()
      .from('whatsapp_config')
      .update({
        evolution_instance_status: isOpen ? 'open' : String(state).toLowerCase(),
        status: isOpen ? 'connected' : 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);
    return;
  }

  // Handle incoming messages (MESSAGES_UPSERT in Evo v1 & v2)
  if (
    !event.includes('messages.upsert') &&
    !event.includes('messages_upsert') &&
    !event.includes('message.upsert') &&
    !event.includes('messages.set')
  ) {
    return;
  }

  const rawData = body.data;
  const dataList = Array.isArray(rawData) ? rawData : [rawData || {}];

  for (const item of dataList) {
    const data = (item || {}) as Record<string, unknown>;
    const key = (data.key || {}) as Record<string, unknown>;

    // Ignore messages sent by ourselves
    if (key.fromMe === true) {
      continue;
    }

    const remoteJid = String(key.remoteJid || '');
    if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('broadcast')) {
      // Ignore group & broadcast messages for CRM contact inbox
      continue;
    }

    const senderPhone = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
    if (!senderPhone) continue;

    const contactName = String(data.pushName || senderPhone);
    const messageId = String(key.id || `evo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const timestamp = data.messageTimestamp as string | number | undefined;

    const msgObj = (data.message || {}) as Record<string, unknown>;
    let messageType = 'text';
    let contentText: string | null = null;
    let mediaUrl: string | null = null;

    if (typeof msgObj.conversation === 'string') {
      contentText = msgObj.conversation;
      messageType = 'text';
    } else if (
      msgObj.extendedTextMessage &&
      typeof (msgObj.extendedTextMessage as Record<string, unknown>).text === 'string'
    ) {
      contentText = (msgObj.extendedTextMessage as Record<string, unknown>).text as string;
      messageType = 'text';
    } else if (msgObj.imageMessage) {
      messageType = 'image';
      const img = msgObj.imageMessage as Record<string, unknown>;
      contentText = (img.caption as string) || null;
      mediaUrl = (img.url as string) || null;
    } else if (msgObj.videoMessage) {
      messageType = 'video';
      const vid = msgObj.videoMessage as Record<string, unknown>;
      contentText = (vid.caption as string) || null;
      mediaUrl = (vid.url as string) || null;
    } else if (msgObj.documentMessage) {
      messageType = 'document';
      const doc = msgObj.documentMessage as Record<string, unknown>;
      contentText = (doc.caption as string) || (doc.fileName as string) || null;
      mediaUrl = (doc.url as string) || null;
    } else if (msgObj.audioMessage) {
      messageType = 'audio';
      const aud = msgObj.audioMessage as Record<string, unknown>;
      mediaUrl = (aud.url as string) || null;
    } else {
      // Fallback text check
      if (data.messageText && typeof data.messageText === 'string') {
        contentText = data.messageText;
        messageType = 'text';
      }
    }

    console.log(`[evolution-webhook] Inbound message from ${senderPhone} (${contactName}): ${contentText || '[Media]'}`);

    await processInboundWhatsAppMessage({
      accountId: config.account_id as string,
      configOwnerUserId: config.user_id as string,
      senderPhone,
      contactName,
      messageId,
      messageType,
      contentText,
      mediaUrl,
      timestamp,
    });
  }
}
