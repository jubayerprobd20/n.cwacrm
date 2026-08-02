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
  const event = String(body.event || '').toLowerCase();
  const instanceName = String(body.instance || '');

  if (!instanceName) {
    console.warn('[evolution-webhook] Missing instance name in payload');
    return;
  }

  // Find whatsapp_config by instance name
  const { data: configs, error } = await supabaseAdmin()
    .from('whatsapp_config')
    .select('*')
    .eq('provider', 'evolution')
    .eq('evolution_instance_name', instanceName);

  if (error || !configs || configs.length === 0) {
    console.warn(`[evolution-webhook] No Evolution config found for instance: ${instanceName}`);
    return;
  }

  const config = configs[0];

  // Handle connection state update
  if (event.includes('connection.update') || event.includes('qrcode.updated') || event.includes('connection_update')) {
    const state = (body.data as { state?: string; status?: string })?.state ||
                  (body.data as { state?: string; status?: string })?.status ||
                  'disconnected';
    await supabaseAdmin()
      .from('whatsapp_config')
      .update({
        evolution_instance_status: String(state).toLowerCase(),
        status: String(state).toLowerCase() === 'open' ? 'connected' : 'disconnected',
      })
      .eq('id', config.id);
    return;
  }

  // Handle incoming messages
  if (!event.includes('messages.upsert') && !event.includes('messages_upsert')) {
    return;
  }

  const data = (body.data || {}) as Record<string, unknown>;
  const key = (data.key || {}) as Record<string, unknown>;

  // Ignore messages sent by ourselves
  if (key.fromMe === true) {
    return;
  }

  const remoteJid = String(key.remoteJid || '');
  if (!remoteJid || remoteJid.includes('@g.us')) {
    // Ignore group messages for CRM contact inbox
    return;
  }

  const senderPhone = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
  const contactName = String(data.pushName || senderPhone);
  const messageId = String(key.id || `evo-${Date.now()}`);
  const timestamp = data.messageTimestamp as string | number | undefined;

  const msgObj = (data.message || {}) as Record<string, unknown>;
  let messageType = 'text';
  let contentText: string | null = null;
  let mediaUrl: string | null = null;

  if (typeof msgObj.conversation === 'string') {
    contentText = msgObj.conversation;
    messageType = 'text';
  } else if (msgObj.extendedTextMessage && typeof (msgObj.extendedTextMessage as Record<string, unknown>).text === 'string') {
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
  }

  await processInboundWhatsAppMessage({
    accountId: config.account_id,
    configOwnerUserId: config.user_id,
    senderPhone,
    contactName,
    messageId,
    messageType,
    contentText,
    mediaUrl,
    timestamp,
  });
}
