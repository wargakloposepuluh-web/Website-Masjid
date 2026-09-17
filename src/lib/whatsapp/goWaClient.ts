import { prisma } from "@/lib/prisma";

export type WAConnectionStatus = "CONNECTED" | "DISCONNECTED" | "SCANNING" | "GATEWAY_OFFLINE";

export interface WADeviceInfo {
  id: string;
  name?: string;
  phone?: string;
}

export interface WAGatewayStatus {
  status: WAConnectionStatus;
  qr: string | null;
  user: WADeviceInfo | null;
  gatewayUrl: string;
  error?: string;
}

class GoWhatsAppClient {
  private defaultGatewayUrl = "http://127.0.0.1:3001";

  /**
   * Mengambil URL dan Kredensial Gateway dari database Setting
   */
  public async getConfig(): Promise<{ gatewayUrl: string; gatewayAuth?: string | null }> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { id: 1 },
        select: { waGatewayUrl: true, waGatewayAuth: true },
      });

      const gatewayUrl = (
        setting?.waGatewayUrl ||
        process.env.WA_GATEWAY_URL ||
        this.defaultGatewayUrl
      ).replace(/\/+$/, "");

      const gatewayAuth = setting?.waGatewayAuth || process.env.WA_GATEWAY_AUTH || null;

      return { gatewayUrl, gatewayAuth };
    } catch {
      return {
        gatewayUrl: (process.env.WA_GATEWAY_URL || this.defaultGatewayUrl).replace(/\/+$/, ""),
        gatewayAuth: process.env.WA_GATEWAY_AUTH || null,
      };
    }
  }

  /**
   * Membentuk HTTP Headers (termasuk Basic Auth bila ada)
   */
  private getHeaders(auth?: string | null, customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...customHeaders };
    if (auth) {
      if (auth.startsWith("Basic ") || auth.startsWith("Bearer ")) {
        headers["Authorization"] = auth;
      } else {
        const base64 = Buffer.from(auth).toString("base64");
        headers["Authorization"] = `Basic ${base64}`;
      }
    }
    return headers;
  }

  /**
   * Format nomor HP ke format Indonesia standar WhatsApp (contoh: 6281234567890)
   */
  public formatPhoneNumber(phone: string, withJidSuffix = false): string {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return withJidSuffix ? `${clean}@s.whatsapp.net` : clean;
  }

  /**
   * Memeriksa status koneksi WhatsApp pada gateway GoWA
   */
  public async getStatus(): Promise<WAGatewayStatus> {
    const { gatewayUrl, gatewayAuth } = await this.getConfig();

    try {
      // 1. Cek endpoint /app/devices
      const devicesRes = await fetch(`${gatewayUrl}/app/devices`, {
        method: "GET",
        headers: this.getHeaders(gatewayAuth),
        cache: "no-store",
      }).catch((err) => {
        throw new Error(`Koneksi ke Gateway Go WhatsApp (${gatewayUrl}) gagal: ${err.message}`);
      });

      if (!devicesRes.ok) {
        // Coba endpoint alternatif /app/status
        const statusRes = await fetch(`${gatewayUrl}/app/status`, {
          method: "GET",
          headers: this.getHeaders(gatewayAuth),
          cache: "no-store",
        });

        if (!statusRes.ok) {
          return {
            status: "GATEWAY_OFFLINE",
            qr: null,
            user: null,
            gatewayUrl,
            error: `Gateway merespons dengan HTTP status ${statusRes.status}`,
          };
        }

        const statusData = await statusRes.json();
        const isConnected =
          statusData?.results?.is_connected ||
          statusData?.results?.is_logged_in ||
          statusData?.data?.is_connected;

        return {
          status: isConnected ? "CONNECTED" : "DISCONNECTED",
          qr: null,
          user: isConnected
            ? {
                id: "whatsapp-masjid",
                name: "WhatsApp Masjid (Gateway)",
                phone: "Aktif",
              }
            : null,
          gatewayUrl,
        };
      }

      const data = await devicesRes.json();
      const devices = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      if (devices.length > 0) {
        const firstDevice = devices[0];
        const rawJid = firstDevice.jid || firstDevice.device || "";
        const cleanPhone = rawJid.replace(/@.*$/, "").replace(/\D/g, "");

        return {
          status: "CONNECTED",
          qr: null,
          user: {
            id: rawJid || "device-1",
            name: firstDevice.name || "WhatsApp Resmi Masjid",
            phone: cleanPhone || undefined,
          },
          gatewayUrl,
        };
      }

      return {
        status: "DISCONNECTED",
        qr: null,
        user: null,
        gatewayUrl,
      };
    } catch (err: any) {
      return {
        status: "GATEWAY_OFFLINE",
        qr: null,
        user: null,
        gatewayUrl,
        error: err.message || "Gagal menghubungi service Go WhatsApp Web",
      };
    }
  }

  /**
   * Mengambil sesi login QR Code dari Go WhatsApp Web
   */
  public async getLoginQr(): Promise<{ status: WAConnectionStatus; qr: string | null; error?: string }> {
    const { gatewayUrl, gatewayAuth } = await this.getConfig();

    try {
      const res = await fetch(`${gatewayUrl}/app/login`, {
        method: "GET",
        headers: this.getHeaders(gatewayAuth),
        cache: "no-store",
      });

      if (!res.ok) {
        return {
          status: "DISCONNECTED",
          qr: null,
          error: `Gagal mengambil QR dari gateway (HTTP ${res.status})`,
        };
      }

      const data = await res.json();
      const qrLink = data?.results?.qr_link || data?.data?.qr_link;
      const qrString = data?.results?.qr || data?.data?.qr;

      let finalQr: string | null = null;
      if (qrLink) {
        // Jika qr_link adalah path relatif, gabungkan dengan gatewayUrl
        finalQr = qrLink.startsWith("http") ? qrLink : `${gatewayUrl}${qrLink.startsWith("/") ? "" : "/"}${qrLink}`;
      } else if (qrString) {
        finalQr = qrString;
      }

      return {
        status: "SCANNING",
        qr: finalQr,
      };
    } catch (err: any) {
      return {
        status: "GATEWAY_OFFLINE",
        qr: null,
        error: err.message || "Gagal meminta QR login dari Gateway",
      };
    }
  }

  /**
   * Mengirim Pesan Teks
   */
  public async sendTextMessage(options: {
    recipientPhone: string;
    message: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { gatewayUrl, gatewayAuth } = await this.getConfig();
    const phone = this.formatPhoneNumber(options.recipientPhone);

    try {
      const res = await fetch(`${gatewayUrl}/send/message`, {
        method: "POST",
        headers: this.getHeaders(gatewayAuth, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          phone: `${phone}@s.whatsapp.net`,
          message: options.message,
        }),
      });

      const data = await res.json();

      if (!res.ok || (data.code && data.code >= 400)) {
        return {
          success: false,
          error: data.message || `Gagal mengirim pesan (HTTP ${res.status})`,
        };
      }

      return {
        success: true,
        messageId: data?.results?.message_id || data?.data?.message_id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Terjadi kesalahan koneksi ke Gateway WhatsApp",
      };
    }
  }

  /**
   * Mengirim Dokumen PDF Surat Resmi
   */
  public async sendPdfDocument(options: {
    recipientPhone: string;
    caption: string;
    pdfBuffer: Buffer;
    fileName: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { gatewayUrl, gatewayAuth } = await this.getConfig();
    const phone = this.formatPhoneNumber(options.recipientPhone);

    try {
      const formData = new FormData();
      formData.append("phone", `${phone}@s.whatsapp.net`);
      formData.append("caption", options.caption || "");

      // Buat file Blob dari buffer
      const blob = new Blob([new Uint8Array(options.pdfBuffer)], { type: "application/pdf" });
      formData.append("file", blob, options.fileName || "Surat_Resmi.pdf");

      const res = await fetch(`${gatewayUrl}/send/file`, {
        method: "POST",
        headers: this.getHeaders(gatewayAuth),
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || (data.code && data.code >= 400)) {
        return {
          success: false,
          error: data.message || `Gagal mengirim dokumen PDF (HTTP ${res.status})`,
        };
      }

      return {
        success: true,
        messageId: data?.results?.message_id || data?.data?.message_id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Gagal menghubungi Gateway WhatsApp saat upload PDF",
      };
    }
  }

  /**
   * Putuskan koneksi perangkat (Logout)
   */
  public async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    const { gatewayUrl, gatewayAuth } = await this.getConfig();

    try {
      const res = await fetch(`${gatewayUrl}/app/logout`, {
        method: "POST",
        headers: this.getHeaders(gatewayAuth),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `Gagal logout dari Gateway (HTTP ${res.status})`,
        };
      }

      return {
        success: true,
        message: "Perangkat WhatsApp berhasil diputus dari Gateway",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Gagal menghubungi Gateway saat proses logout",
      };
    }
  }
}

export const goWaClient = new GoWhatsAppClient();
