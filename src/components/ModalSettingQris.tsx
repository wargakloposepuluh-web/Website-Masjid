"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  CreditCard,
  FileText,
  Eye,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalSettingQris({ isOpen, onClose, onSuccess }: Props) {
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [qrisBank, setQrisBank] = useState("Bank Syariah Indonesia (BSI)");
  const [qrisNama, setQrisNama] = useState("Masjid Baitul Maghfirah");
  const [qrisNmid, setQrisNmid] = useState("ID1020304050607");
  const [qrisRekening, setQrisRekening] = useState("7123456789");
  const [qrisKeterangan, setQrisKeterangan] = useState("Infaq & Shodaqoh Digital");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchQrisData();
    }
  }, [isOpen]);

  const fetchQrisData = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/keuangan/qris");
      if (res.ok) {
        const json = await res.json();
        const d = json.data;
        if (d) {
          setQrisImageUrl(d.qrisImageUrl || "");
          setQrisBank(d.qrisBank || "Bank Syariah Indonesia (BSI)");
          setQrisNama(d.qrisNama || "Masjid Baitul Maghfirah");
          setQrisNmid(d.qrisNmid || "ID1020304050607");
          setQrisRekening(d.qrisRekening || "7123456789");
          setQrisKeterangan(d.qrisKeterangan || "Infaq & Shodaqoh Digital");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setQrisImageUrl(json.fileUrl);
      } else {
        setErrorMsg("Gagal mengupload gambar QRIS.");
      }
    } catch (err) {
      setErrorMsg("Kesalahan koneksi saat upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

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

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg("Pengaturan QRIS berhasil disimpan dan langsung tampil di TV Display!");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(json.error || "Gagal menyimpan QRIS.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <span className="p-3 rounded-2xl bg-orange-100 text-orange-600">
            <QrCode className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Pengaturan QRIS & Rekening Infaq
            </h3>
            <p className="text-xs text-slate-500">
              Informasi QRIS akan otomatis tampil di layar TV Display Masjid
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload Foto QRIS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gambar Kode QRIS (Barcode)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {qrisImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrisImageUrl}
                    alt="QRIS Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <QrCode className="w-10 h-10 text-slate-300" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold cursor-pointer border border-orange-200 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "Mengupload..." : "Unggah Gambar QRIS"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  Format JPG/PNG, pastikan barcode tajam dan kontras agar mudah discan oleh HP jamaah.
                </p>
              </div>
            </div>
          </div>

          {/* Nama Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Bank / Dompet Digital
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={qrisBank}
                onChange={(e) => setQrisBank(e.target.value)}
                placeholder="Contoh: Bank Syariah Indonesia (BSI) / QRIS"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Atas Nama Rekening */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Atas Nama Rekening / Merchant QRIS
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={qrisNama}
                onChange={(e) => setQrisNama(e.target.value)}
                placeholder="Contoh: DKM Masjid Baitul Maghfirah"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nomor Rekening */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Rekening
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={qrisRekening}
                  onChange={(e) => setQrisRekening(e.target.value)}
                  placeholder="Contoh: 7123456789"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* NMID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NMID QRIS (Opsional)
              </label>
              <input
                type="text"
                value={qrisNmid}
                onChange={(e) => setQrisNmid(e.target.value)}
                placeholder="Contoh: ID1020304050607"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Keterangan Infaq */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Ajakan Infaq
            </label>
            <input
              type="text"
              value={qrisKeterangan}
              onChange={(e) => setQrisKeterangan(e.target.value)}
              placeholder="Contoh: Infaq & Shodaqoh Operasional Masjid"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm py-3 rounded-2xl shadow-md shadow-orange-500/25 transition active:scale-98 disabled:opacity-50 mt-4"
          >
            <span>{loading ? "Menyimpan QRIS..." : "Simpan Pengaturan QRIS"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
