"use client";

import React, { useState, useEffect } from "react";
import { QrCode, UploadCloud, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function KeuanganQrisPage() {
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [qrisBank, setQrisBank] = useState("");
  const [qrisNama, setQrisNama] = useState("");
  const [qrisNmid, setQrisNmid] = useState("");
  const [qrisRekening, setQrisRekening] = useState("");
  const [qrisKeterangan, setQrisKeterangan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchQrisData();
  }, []);

  const fetchQrisData = async () => {
    try {
      const res = await fetch("/api/keuangan/qris");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        setQrisImageUrl(data.qrisImageUrl || "/qris-masjid.png");
        setQrisBank(data.qrisBank || "Bank Syariah Indonesia (BSI)");
        setQrisNama(data.qrisNama || "Masjid Baitul Maghfirah");
        setQrisNmid(data.qrisNmid || "");
        setQrisRekening(data.qrisRekening || "");
        setQrisKeterangan(data.qrisKeterangan || "Scan untuk Infaq, Sedekah dan Donasi");
      }
    } catch (e) {
      console.error("Gagal load QRIS data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setQrisImageUrl(data.url);
      } else {
        alert("Gagal upload gambar: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat upload gambar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/keuangan/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrisImageUrl,
          qrisBank,
          qrisNama,
          qrisNmid,
          qrisRekening,
          qrisKeterangan,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Pengaturan QRIS berhasil disimpan!" });
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan pengaturan QRIS." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi saat menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Pengaturan QRIS Infaq
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur gambar barcode QRIS dan informasi rekening yang akan ditampilkan di halaman TV Display & Portal Jamaah.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-md shadow-emerald-600/20 transition active:scale-95"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri: Upload Gambar */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Gambar Barcode QRIS
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition relative overflow-hidden group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {uploading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                <RefreshCw className="w-8 h-8 mb-2 animate-spin text-emerald-500" />
                <span className="text-sm">Mengunggah...</span>
              </div>
            ) : qrisImageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrisImageUrl}
                  alt="QRIS Preview"
                  className="max-w-[240px] w-full h-auto mx-auto object-contain bg-white rounded-xl shadow-sm border border-slate-200"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Ganti Gambar
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-600">Klik untuk unggah gambar QRIS</span>
                <span className="text-xs text-slate-400 mt-1">Format: JPG, PNG (Maks. 2MB)</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Tajuk Ajakan Berinfaq
              </label>
              <input
                type="text"
                value={qrisKeterangan}
                onChange={(e) => setQrisKeterangan(e.target.value)}
                placeholder="Cth: Infaq & Shodaqoh Digital Masjid"
                className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Info Bank */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pemilik Rekening (Sesuai QRIS)
            </label>
            <input
              type="text"
              value={qrisNama}
              onChange={(e) => setQrisNama(e.target.value)}
              placeholder="Cth: Masjid Baitul Maghfirah"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Bank / Penyelenggara Jasa
            </label>
            <input
              type="text"
              value={qrisBank}
              onChange={(e) => setQrisBank(e.target.value)}
              placeholder="Cth: Bank Syariah Indonesia (BSI)"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Rekening (Opsional)
            </label>
            <input
              type="text"
              value={qrisRekening}
              onChange={(e) => setQrisRekening(e.target.value)}
              placeholder="Cth: 7123456789"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NMID (Opsional)
            </label>
            <input
              type="text"
              value={qrisNmid}
              onChange={(e) => setQrisNmid(e.target.value)}
              placeholder="Cth: ID1020304050607"
              className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <p>
              Pastikan gambar QRIS yang diunggah dapat di-scan dengan baik. Info ini akan ditampilkan secara publik di Halaman Portal dan Mode TV Display Masjid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
