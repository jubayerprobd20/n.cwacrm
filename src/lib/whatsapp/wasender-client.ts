// ============================================================
// WASender API Client (Gateway & Session API)
// Provides support for checking session status, fetching QR code,
// and sending text and media messages via WASender servers.
// ============================================================

export interface WASenderConfig {
  baseUrl: string;
  apiKey: string;
  deviceId?: string;
}

export interface WASenderStatusResponse {
  success: boolean;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'SCAN_QR_CODE' | 'CONNECTING';
  error?: string;
}

export interface WASenderQrResponse {
  success: boolean;
  qr?: string;
  error?: string;
}

function cleanBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Checks the session status of a WASender device/session.
 */
export async function getWASenderStatus(
  config: WASenderConfig
): Promise<WASenderStatusResponse> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/status`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'X-Device-Id': config.deviceId || '',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${res.status}: Failed to get WASender status`,
      };
    }

    return {
      success: true,
      status: data?.status || (data?.connected ? 'CONNECTED' : 'DISCONNECTED'),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error checking WASender status',
    };
  }
}

/**
 * Fetches the QR code (base64 image or text string) for WASender connection.
 */
export async function getWASenderQrCode(
  config: WASenderConfig
): Promise<WASenderQrResponse> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/qr`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'X-Device-Id': config.deviceId || '',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${res.status}: Failed to fetch WASender QR code`,
      };
    }

    return {
      success: true,
      qr: data?.qr || data?.qrcode || data?.base64,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error fetching WASender QR code',
    };
  }
}

/**
 * Sends a text message via WASender API.
 */
export async function sendWASenderText(
  config: WASenderConfig,
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/send-message`;
    const cleanPhone = to.replace(/\D/g, '');
    const payload = {
      phone: cleanPhone,
      message: text,
      device_id: config.deviceId,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${res.status}: Failed to send text via WASender`,
      };
    }

    const messageId = data?.message_id || data?.id || `wasender-${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error sending text via WASender',
    };
  }
}

/**
 * Sends a media message via WASender API.
 */
export async function sendWASenderMedia(
  config: WASenderConfig,
  to: string,
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'document' | 'audio',
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${cleanBaseUrl(config.baseUrl)}/send-media`;
    const cleanPhone = to.replace(/\D/g, '');
    const payload = {
      phone: cleanPhone,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption || '',
      device_id: config.deviceId,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${res.status}: Failed to send media via WASender`,
      };
    }

    const messageId = data?.message_id || data?.id || `wasender-media-${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error sending media via WASender',
    };
  }
}
