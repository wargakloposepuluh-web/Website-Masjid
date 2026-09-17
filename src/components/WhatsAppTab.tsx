"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Send,
  Loader2,
  ShieldCheck,
  Zap,
  Server,
  Key,
  ExternalLink,
  FileText,
} from "lucide-react";

interface WAStatusResponse {
  status: "CONNECTED" | "DISCONNECTED" | "SCANNING" | "GATEWAY_OFFLINE";
  qr: string | null;
  user: {
    id: string;
    name?: string;
    phone?: string;
  } | null;
  gatewayUrl?: string;
  error?: string;
}

export default function WhatsAppTab() {
  const [waState, setWaState] = useState<WAStatusResponse>({
    status: "DISCONNECTED",
    qr: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Gateway Settings
  const [gatewayUrl, setGatewayUrl] = useState("http://127.0.0.1:3001");
  const [gatewayAuth, setGatewayAuth] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Send states
  const [testPhone, setTestPhone] = useState("");
  const [testMode, setTestMode] = useState<"pdf" | "text">("pdf");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // Ambil pengaturan yang tersimpan
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.waGatewayUrl) setGatewayUrl(data.waGatewayUrl);
        if (data.waGatewayAuth) setGatewayAuth(data.waGatewayAuth);
      }
    } catch (err) {
      console.error("Gagal mengambil pengaturan gateway:", err);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data: WAStatusResponse = await res.json();
        setWaState((prev) => {
          // Jika sebelumnya sedang SCANNING dan ada QR code aktif:
          if (prev.status === "SCANNING" && prev.qr) {
            // Hanya ganti jika status baru sudah resmi CONNECTED
            if (data.status === "CONNECTED") {
              return data;
            }
            // Jika status masih DISCONNECTED di gateway, pertahankan QR code dan status SCANNING
            return {
              ...data,
              status: "SCANNING",
              qr: prev.qr,
            };
          }
          return data;
        });

        if (data.gatewayUrl && !gatewayUrl) {
          setGatewayUrl(data.gatewayUrl);
        }
      }
    } catch (err) {
      console.error("Gagal memeriksa status WhatsApp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    checkStatus();

    pollTimer.current = setInterval(() => {
      checkStatus();
    }, 4000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waGatewayUrl: gatewayUrl.trim(),
          waGatewayAuth: gatewayAuth.trim() || null,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await checkStatus();
      } else {
        alert("Gagal menyimpan pengaturan gateway");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRequestQr = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.qr) {
        setWaState((prev) => ({
          ...prev,
          status: "SCANNING",
          qr: data.qr,
          error: undefined,
        }));
      } else if (data.error) {
        alert("Pemberitahuan: " + data.error);
      } else {
        alert("Gagal mendapatkan QR Code dari Gateway WhatsApp.");
      }
    } catch (err: any) {
      console.error("Gagal meminta QR login:", err);
      alert("Terjadi kesalahan saat meminta QR login dari Gateway: " + (err.message || ""));
    } finally {
      setActionLoading(false);
      // Jangan panggil checkStatus() di sini agar QR code yang baru didapat tidak langsung tertimpa
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan sesi WhatsApp pada nomor ini?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaState({
          status: "DISCONNECTED",
          qr: null,
          user: null,
        });
      } else {
        alert(data.error || "Gagal memutuskan koneksi WhatsApp");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memutuskan koneksi");
    } finally {
      setActionLoading(false);
      checkStatus();
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setTestSending(true);
    setTestResult(null);

    try {
      let bodyData: any = {
        recipientPhone: testPhone,
        caption:
          "🟢 *UJI KONEKSI WHATSAPP MASJID*\n\nAlhamdulillah, pengiriman pesan melalui service Go WhatsApp Web Multi-Device v4 berhasil terhubung dengan sistem SIMAS Masjid.",
      };

      if (testMode === "pdf") {
        // Mock sample PDF
        const dummyPdfBase64 =
          "JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTEKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECltUZXN0IFBlbmdpcmltYW4gU3VyYXQgU0lNQVMgTWFzamlkXSBUSgpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMyMAolJUVPRg==";
        bodyData.pdfBase64 = dummyPdfBase64;
        bodyData.fileName = "Uji_Koneksi_SIMAS_Masjid.pdf";
      }

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Berhasil terkirim ke ${testPhone} (ID Pesan: ${data.messageId || "OK"})`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal mengirim pesan melalui Gateway Go WhatsApp",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "Error: " + err.message,
      });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8">
      {/* Header Info */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Go WhatsApp Web Multi-Device v4</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Gateway WhatsApp Masjid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aplikasi terhubung langsung ke service REST API <strong>Go WhatsApp Web Multi-Device v4</strong> di VPS Anda untuk efisiensi RAM dan stabilitas pengiriman surat PDF.
          </p>
        </div>

        {/* Live Status Badge */}
        <div>
          {loading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memeriksa...</span>
            </span>
          ) : waState.status === "CONNECTED" ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp Terhubung</span>
            </span>
          ) : waState.status === "SCANNING" ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Menunggu Scan QR</span>
            </span>
          ) : waState.status === "GATEWAY_OFFLINE" ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Gateway Offline</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Belum Tertaut</span>
            </span>
          )}
        </div>
      </div>

      {/* Peringatan jika Gateway Offline */}
      {waState.status === "GATEWAY_OFFLINE" && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Service Go WhatsApp Tidak Terjangkau</p>
            <p className="text-rose-800 leading-relaxed">
              Sistem tidak dapat terhubung ke endpoint Go WhatsApp di <code>{gatewayUrl}</code>.
              Pastikan service <strong>go-whatsapp-web-multidevice</strong> di VPS Anda sudah berjalan (misal pada port 3001) dan URL di bawah sudah sesuai.
            </p>
            {waState.error && (
              <p className="text-[11px] text-rose-600 font-mono bg-rose-100/70 p-2 rounded-lg mt-2">
                Detail Error: {waState.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 1. KARTU STATUS KONEKSI & LOGIN */}
      {waState.status === "CONNECTED" ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Akun WhatsApp Aktif
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {waState.user?.name || "WhatsApp Resmi Masjid"}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Nomor Akun:{" "}
                <span className="font-bold text-emerald-900">
                  {waState.user?.phone ? `+${waState.user.phone}` : "Aktif di Gateway"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 font-semibold text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Putuskan Sesi / Logout</span>
          </button>
        </div>
      ) : (
        /* Jika Belum Login (Disconnected / Scanning / Offline) */
        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Penautan Akun WhatsApp (Scan QR)
                </h3>
                <p className="text-xs text-slate-500">
                  Hubungkan nomor WhatsApp resmi masjid melalui QR Code perangkat tertaut.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestQr}
                disabled={actionLoading || waState.status === "GATEWAY_OFFLINE"}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Minta Kode QR</span>
              </button>
            </div>
          </div>

          {/* QR Display Area */}
          {waState.qr ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
              <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-emerald-300 shadow-md text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={waState.qr}
                  alt="Scan WhatsApp QR Code"
                  className="w-60 h-60 object-contain rounded-xl p-2 bg-white"
                />
                <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                  Segera pindai dengan ponsel Anda sebelum QR kedaluwarsa
                </p>
              </div>

              <div className="max-w-sm space-y-3 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Petunjuk Pemindaian di HP:</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>Buka WhatsApp di ponsel pengurus/sekretariat.</li>
                  <li>Ketuk menu <strong>Titik Tiga ⋮</strong> atau <strong>Pengaturan ⚙️</strong>.</li>
                  <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong>.</li>
                  <li>Ketuk <strong>Tautkan Perangkat</strong> dan arahkan kamera ke QR Code di samping.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 space-y-2">
              <p>Belum ada QR Code yang aktif. Klik tombol <strong>&quot;Minta Kode QR&quot;</strong> di atas untuk memulai sesi baru.</p>
              <p className="text-[11px] text-slate-400">
                Atau Anda juga bisa membuka dashboard bawaan Go WhatsApp langsung di port <code>{gatewayUrl}</code> jika ingin mengelola perangkat.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. FORM PENGATURAN GATEWAY */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Server className="w-4 h-4 text-emerald-600" />
          <span>Konfigurasi Endpoint Go WhatsApp Gateway</span>
        </div>
        <p className="text-xs text-slate-500">
          Tentukan alamat internal REST API Go WhatsApp Web Multi-Device yang aktif di VPS.
        </p>

        <form onSubmit={handleSaveGateway} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>URL REST API Gateway</span>
              </label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="http://127.0.0.1:3001"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Rekomendasi: <code>http://127.0.0.1:3001</code> (agar tidak bentrok dengan SIMAS di port 3000).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Kredensial Basic Auth (Opsional)</span>
              </label>
              <input
                type="text"
                value={gatewayAuth}
                onChange={(e) => setGatewayAuth(e.target.value)}
                placeholder="username:password (jika diaktifkan pada flag -b)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Kosongkan jika service Go WhatsApp Anda tidak menggunakan autentikasi kata sandi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Konfigurasi Gateway</span>
            </button>

            <button
              type="button"
              onClick={checkStatus}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tes Sambungan</span>
            </button>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3. UJI COBA PENGIRIMAN */}
      <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Uji Coba Pengiriman Langsung via Gateway
          </h4>
        </div>
        <p className="text-xs text-slate-500">
          Uji coba apakah pesan teks dan file PDF berhasil dikirim melalui service Go WhatsApp ke ponsel Anda.
        </p>

        <form onSubmit={handleSendTest} className="space-y-3 max-w-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Nomor WA (contoh: 08123456789)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTestMode("pdf")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  testMode === "pdf"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Surat</span>
              </button>
              <button
                type="button"
                onClick={() => setTestMode("text")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  testMode === "text"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Teks Saja
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={testSending || !testPhone}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {testSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Kirim Uji Coba {testMode === "pdf" ? "Surat PDF" : "Pesan Teks"}</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`text-xs p-3 rounded-xl border flex items-start gap-2 ${
              testResult.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? "Pengiriman Berhasil" : "Pengiriman Gagal"}</p>
              <p className="mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. PANDUAN RINGKAS VPS */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold">Tips Penataan Port & Keamanan di VPS IDCloudHost:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
            <li>
              <strong>Port Go WhatsApp:</strong> Pastikan binary Go WhatsApp dijalankan dengan port <code>3001</code> (misal: <code>./whatsapp-linux-amd64 --port=3001</code> atau <code>-p 3001</code>).
            </li>
            <li>
              <strong>Port SIMAS Masjid:</strong> Berjalan di port <code>3000</code> dan diekspos melalui Nginx reverse proxy ke domain/IP publik.
            </li>
            <li>
              Service Go WhatsApp tidak perlu dibuka ke publik di port 3001 jika hanya digunakan internal oleh SIMAS, sehingga jauh lebih aman.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
