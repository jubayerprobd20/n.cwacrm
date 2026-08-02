// ============================================================
// Evolution API Client (Open-Source Baileys / v1 & v2 REST API)
// Provides full support for instance creation, QR code scanning,
// connection status monitoring, webhook registration, and sending
// text, media, and interactive messages.
// ============================================================

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

export interface EvolutionQrResponse {
  base64?: string;
  code?: string;
  count?: number;
  error?: string;
}

export interface EvolutionConnectionState {
  instance?: {
    state?: 'open' | 'connecting' | 'close' | 'refused';
  };
  state?: 'open' | 'connecting' | 'close' | 'refused';
  error?: string;
}

function cleanBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Creates a new WhatsApp instance in Evolution API.
 */
export async function createEvolutionInstance(
  config: EvolutionConfig,
  webhookUrl?: string
): Promise<{ success: boolean; hash?: string; qrcode?: EvolutionQrResponse; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/instance/create`;
    const payload: Record<string, unknown> = {
      instanceName: config.instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorDetail = Array.isArray(data?.message)
        ? data.message.join(', ')
        : (typeof data?.message === 'string' ? data.message : data?.error) || `HTTP ${res.status}: Failed to create Evolution instance`;
      return {
        success: false,
        error: errorDetail,
      };
    }

    return {
      success: true,
      hash: data?.hash,
      qrcode: data?.qrcode,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown network error connecting to Evolution API',
    };
  }
}

/**
 * Fetches the live QR code or pairing string for an instance.
 */
export async function getEvolutionQrCode(
  config: EvolutionConfig
): Promise<EvolutionQrResponse> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/instance/connect/${config.instanceName}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: config.apiKey,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data?.error || data?.message || `HTTP ${res.status}: Failed to fetch QR code`,
      };
    }

    return {
      base64: data?.base64 || data?.qrcode?.base64,
      code: data?.code || data?.qrcode?.code || data?.pairingCode,
      count: data?.count || data?.qrcode?.count,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to connect to Evolution API server',
    };
  }
}

/**
 * Checks the connection state of an Evolution API instance.
 */
export async function getEvolutionConnectionState(
  config: EvolutionConfig
): Promise<EvolutionConnectionState> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/instance/connectionState/${config.instanceName}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { apikey: config.apiKey },
      signal: AbortSignal.timeout(8000), // 8s timeout — don't hang Vercel serverless
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data?.error || data?.message || `HTTP ${res.status}: Failed to get connection state`,
      };
    }

    return data;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error checking Evolution API state',
    };
  }
}

/**
 * Logs out and disconnects the Evolution API instance.
 */
export async function logoutEvolutionInstance(
  config: EvolutionConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/instance/logout/${config.instanceName}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: config.apiKey,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `HTTP ${res.status}: Failed to logout instance`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error logging out Evolution API instance',
    };
  }
}

/**
 * Sets the webhook endpoint for an Evolution API instance.
 */
export async function setEvolutionWebhook(
  config: EvolutionConfig,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Evolution API v2 uses a flat structure; v1 uses { webhook: { ... } }
  // We try v2 format first, then fall back to v1 format on failure.
  const eventsV2 = ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'];
  const eventsV1 = ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'];

  const payloadV2 = {
    enabled: true,
    url: webhookUrl,
    webhookByEvents: false,
    webhookBase64: false,
    events: eventsV2,
  };

  const payloadV1 = {
    webhook: {
      enabled: true,
      url: webhookUrl,
      events: eventsV1,
    },
  };

  const trySet = async (payload: Record<string, unknown>) => {
    const url = `${cleanBaseUrl(config.baseUrl)}/webhook/set/${config.instanceName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { apikey: config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  try {
    // Try v2 format first
    const v2 = await trySet(payloadV2);
    if (v2.ok) return { success: true };

    // Fall back to v1 format
    const v1 = await trySet(payloadV1);
    if (v1.ok) return { success: true };

    return {
      success: false,
      error: v1.data?.error || v1.data?.message || 'Failed to set webhook (both v1 and v2 formats tried)',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error setting webhook in Evolution API',
    };
  }
}

/**
 * Sends a text message via Evolution API.
 */
export async function sendEvolutionText(
  config: EvolutionConfig,
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/message/sendText/${config.instanceName}`;
    const cleanPhone = to.replace(/\D/g, '');
    const payload = {
      number: cleanPhone,
      textMessage: {
        text,
      },
      options: {
        delay: 1200,
        presence: 'composing',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `HTTP ${res.status}: Failed to send message`,
      };
    }

    const messageId =
      data?.key?.id || data?.message?.key?.id || data?.id || `evo-${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error sending text via Evolution API',
    };
  }
}

/**
 * Sends a media message (image, video, document, audio) via Evolution API.
 */
export async function sendEvolutionMedia(
  config: EvolutionConfig,
  to: string,
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'document' | 'audio',
  caption?: string,
  fileName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/message/sendMedia/${config.instanceName}`;
    const cleanPhone = to.replace(/\D/g, '');
    const payload = {
      number: cleanPhone,
      mediaMessage: {
        mediatype: mediaType,
        media: mediaUrl,
        caption: caption || '',
        fileName: fileName || 'file',
      },
      options: {
        delay: 1500,
        presence: 'composing',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `HTTP ${res.status}: Failed to send media`,
      };
    }

    const messageId =
      data?.key?.id || data?.message?.key?.id || data?.id || `evo-media-${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error sending media via Evolution API',
    };
  }
}
