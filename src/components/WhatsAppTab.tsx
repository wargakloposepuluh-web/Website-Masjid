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
} from "lucide-react";

interface WAStatusResponse {
  status: "DISCONNECTED" | "SCANNING" | "CONNECTED";
  qr: string | null;
  user: {
    id: string;
    name?: string;
    phone?: string;
  } | null;
}

export default function WhatsAppTab() {
  const [waState, setWaState] = useState<WAStatusResponse>({
    status: "DISCONNECTED",
    qr: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data: WAStatusResponse = await res.json();
        setWaState(data);
      }
    } catch (err) {
      console.error("Gagal memeriksa status WhatsApp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    pollTimer.current = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setWaState((prev) => ({
          ...prev,
          status: data.status || "SCANNING",
          qr: data.qr || null,
        }));
      }
    } catch (err) {
      console.error("Gagal memulai koneksi WhatsApp:", err);
      alert("Terjadi kesalahan saat memulai koneksi WhatsApp");
    } finally {
      setActionLoading(false);
      checkStatus();
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan koneksi WhatsApp ini?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      if (res.ok) {
        setWaState({
          status: "DISCONNECTED",
          qr: null,
          user: null,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memutuskan koneksi");
    } finally {
      setActionLoading(false);
      checkStatus();
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setTestSending(true);
    setTestResult(null);

    try {
      // Create a small mock PDF dummy buffer
      const dummyPdfBase64 =
        "JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTEKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECltUZXN0IFBlbmdpcmltYW4gU3VyYXQgREtNIEJhaXR1bCBNYWdoZmlyYWhdIFRKCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzIwCiUlRU9G";

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: testPhone,
          caption:
            "🟢 *UJI KONEKSI WHATSAPP MASJID BAITUL MAGHFIRAH*\n\nAlhamdulillah, sistem persuratan WhatsApp Masjid Baitul Maghfirah telah aktif dan terhubung dengan baik.",
          pdfBase64: dummyPdfBase64,
          fileName: "Uji_Koneksi_Masjid_Baitul_Maghfirah.pdf",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult("Pesan uji coba dan PDF berhasil terkirim ke " + testPhone);
      } else {
        setTestResult("Gagal: " + (data.error || "Pesan tidak terkirim"));
      }
    } catch (err: any) {
      setTestResult("Gagal: " + err.message);
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
            <span>Integrasi WhatsApp Otomatis</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Koneksi & Sesi WhatsApp Masjid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tautkan akun WhatsApp sekretariat masjid untuk dapat mengirim dokumen surat PDF resmi langsung ke nomor pengurus dan jamaah.
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
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>WhatsApp Terputus</span>
            </span>
          )}
        </div>
      </div>

      {/* STATE 1: CONNECTED */}
      {waState.status === "CONNECTED" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Akun Tertaut Aktif
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {waState.user?.name || "WhatsApp Masjid Baitul Maghfirah"}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Nomor HP: <span className="font-bold text-emerald-900">+{waState.user?.phone || "-"}</span>
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
              <span>Putuskan Koneksi</span>
            </button>
          </div>

          {/* Test Send Section */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Uji Coba Pengiriman Pesan & PDF
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Ketikkan nomor WhatsApp Anda untuk mencoba mengirim dokumen PDF uji coba langsung dari server.
            </p>

            <form onSubmit={handleSendTestMessage} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={testSending || !testPhone}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 active:scale-95"
              >
                {testSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Kirim Uji Coba</span>
              </button>
            </form>

            {testResult && (
              <p
                className={`text-xs font-semibold p-2.5 rounded-xl border ${
                  testResult.startsWith("Pesan")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {testResult}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STATE 2: SCANNING (QR CODE DISPLAY) */}
      {waState.status === "SCANNING" && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
          {/* QR Code Container */}
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 text-center">
            {waState.qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={waState.qr}
                alt="Scan WhatsApp QR Code"
                className="w-64 h-64 object-contain rounded-xl p-2 bg-white shadow-sm"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs font-medium">Sedang menghasilkan kode QR...</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold mt-3">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Kode QR aktif — Segera pindai dengan ponsel Anda</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="max-w-sm space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Cara Menautkan Perangkat:
              </h3>
            </div>

            <ol className="space-y-3 text-slate-600 list-decimal list-inside leading-relaxed">
              <li className="pl-1">
                Buka aplikasi <strong>WhatsApp</strong> di HP Anda.
              </li>
              <li className="pl-1">
                Ketuk menu <strong>Titik Tiga ⋮</strong> (Android) atau <strong>Pengaturan ⚙️</strong> (iPhone).
              </li>
              <li className="pl-1">
                Pilih menu <strong>Perangkat Tertaut</strong> (Linked Devices).
              </li>
              <li className="pl-1">
                Ketuk tombol <strong>Tautkan Perangkat</strong>.
              </li>
              <li className="pl-1">
                Arahkan kamera ponsel Anda ke kotak <strong>Kode QR</strong> di samping.
              </li>
            </ol>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleConnect}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh QR</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: DISCONNECTED */}
      {waState.status === "DISCONNECTED" && (
        <div className="py-12 px-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-900">
              WhatsApp Belum Terhubung
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tekan tombol di bawah untuk memunculkan Kode QR. Setelah dipindai menggunakan HP, aplikasi akan otomatis dapat mengirimkan file PDF surat ke WhatsApp seluruh pengurus dan jamaah.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4" />
            )}
            <span>Mulai Hubungkan WhatsApp (Scan QR)</span>
          </button>
        </div>
      )}

      {/* Security & Anti-Spam Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold">Keamanan Akun & Tips Pemakaian:</p>
          <p className="text-[11px] text-amber-800">
            Disarankan menggunakan nomor WhatsApp resmi Masjid / Sekretariat. Sistem telah dilengkapi jeda pengiriman otomatis (2–3 detik per pesan) untuk menjaga keamanan nomor agar tidak dicurigai sebagai spam oleh server WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
