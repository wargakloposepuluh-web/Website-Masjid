import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";
import fs from "fs";
import path from "path";

export type WAConnectionStatus = "DISCONNECTED" | "SCANNING" | "CONNECTED";

interface WAUserState {
  id: string;
  name?: string;
  phone?: string;
}

class WhatsAppClientManager {
  private sock: WASocket | null = null;
  private status: WAConnectionStatus = "DISCONNECTED";
  private qrCode: string | null = null;
  private user: WAUserState | null = null;
  private isConnecting: boolean = false;
  private authDir: string;

  constructor() {
    this.authDir = path.join(process.cwd(), "storage", "whatsapp-auth");
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  public getStatus() {
    return {
      status: this.status,
      qr: this.qrCode,
      user: this.user,
    };
  }

  public async connect(): Promise<{ status: WAConnectionStatus; qr: string | null }> {
    if (this.status === "CONNECTED" && this.sock) {
      return { status: this.status, qr: null };
    }

    if (this.isConnecting) {
      return { status: this.status, qr: this.qrCode };
    }

    this.isConnecting = true;
    this.status = "SCANNING";

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }) as any,
        printQRInTerminal: false,
        browser: ["Masjid Baitul Maghfirah", "Desktop", "1.0.0"],
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      this.sock = sock;

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrCode = await QRCode.toDataURL(qr);
            this.status = "SCANNING";
          } catch (err) {
            console.error("Gagal generate QR Code DataURL:", err);
          }
        }

        if (connection === "open") {
          this.status = "CONNECTED";
          this.qrCode = null;
          this.isConnecting = false;

          const rawId = sock.user?.id || "";
          const cleanPhone = rawId.split(":")[0] || rawId.split("@")[0];

          this.user = {
            id: rawId,
            name: sock.user?.name || "Sekretariat Masjid Baitul Maghfirah",
            phone: cleanPhone,
          };
          console.log("WhatsApp Berhasil Terhubung:", this.user);
        }

        if (connection === "close") {
          this.isConnecting = false;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(
            `Koneksi WhatsApp tertutup karena ${statusCode}. Mencoba sambung kembali: ${shouldReconnect}`
          );

          if (shouldReconnect) {
            // Reconnect jika bukan karena logout sengaja
            setTimeout(() => {
              this.connect().catch((e) => console.error("Reconnect error:", e));
            }, 3000);
          } else {
            // Logged out
            this.status = "DISCONNECTED";
            this.qrCode = null;
            this.user = null;
            this.sock = null;
            this.clearAuthStorage();
          }
        }
      });

      return { status: this.status, qr: this.qrCode };
    } catch (err) {
      this.isConnecting = false;
      this.status = "DISCONNECTED";
      console.error("Error saat inisialisasi WhatsApp:", err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (_) {}
        try {
          this.sock.end(undefined);
        } catch (_) {}
        this.sock = null;
      }
    } finally {
      this.status = "DISCONNECTED";
      this.qrCode = null;
      this.user = null;
      this.isConnecting = false;
      this.clearAuthStorage();
    }
  }

  private clearAuthStorage() {
    try {
      if (fs.existsSync(this.authDir)) {
        fs.rmSync(this.authDir, { recursive: true, force: true });
        fs.mkdirSync(this.authDir, { recursive: true });
      }
    } catch (err) {
      console.error("Gagal membersihkan auth folder:", err);
    }
  }

  public formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return clean + "@s.whatsapp.net";
  }

  public async sendPdfDocument(options: {
    recipientPhone: string;
    caption: string;
    pdfBuffer: Buffer;
    fileName: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (this.status !== "CONNECTED" || !this.sock) {
      throw new Error("WhatsApp belum terhubung. Silakan lakukan scan QR terlebih dahulu di menu Pengaturan.");
    }

    const jid = this.formatPhoneNumber(options.recipientPhone);

    try {
      const result = await this.sock.sendMessage(jid, {
        document: options.pdfBuffer,
        mimetype: "application/pdf",
        fileName: options.fileName,
        caption: options.caption,
      });

      return {
        success: true,
        messageId: result?.key?.id || undefined,
      };
    } catch (err: any) {
      console.error(`Gagal mengirim PDF ke ${jid}:`, err);
      return {
        success: false,
        error: err.message || "Gagal mengirim pesan WhatsApp",
      };
    }
  }
}

// Global Singleton to ensure state persistence across Fast Refresh
const globalForWA = globalThis as unknown as {
  __waClientManager?: WhatsAppClientManager;
};

export const waClient =
  globalForWA.__waClientManager || new WhatsAppClientManager();

if (process.env.NODE_ENV !== "production") {
  globalForWA.__waClientManager = waClient;
}
