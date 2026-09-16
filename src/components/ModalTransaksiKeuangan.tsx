"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  HeartHandshake,
  Trash2,
  Loader2,
} from "lucide-react";

interface ModalTransaksiProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function ModalTransaksiKeuangan({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ModalTransaksiProps) {
  const [jenis, setJenis] = useState<"MASUK" | "KELUAR">("MASUK");
  const [kategoriKas, setKategoriKas] = useState<"JARIYAH" | "INFAQ">("JARIYAH");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [nominalDisplay, setNominalDisplay] = useState("");
  const [nominal, setNominal] = useState<number>(0);
  const [keterangan, setKeterangan] = useState("");
  const [buktiFotoUrl, setBuktiFotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setJenis(initialData.jenis || "MASUK");
      setKategoriKas(initialData.kategoriKas || "JARIYAH");
      setTanggal(
        initialData.tanggal
          ? new Date(initialData.tanggal).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      const nom = initialData.nominal || 0;
      setNominal(nom);
      setNominalDisplay(nom.toLocaleString("id-ID"));
      setKeterangan(initialData.keterangan || "");
      setBuktiFotoUrl(initialData.buktiFotoUrl || "");
    } else {
      setJenis("MASUK");
      setKategoriKas("JARIYAH");
      setTanggal(new Date().toISOString().split("T")[0]);
      setNominal(0);
      setNominalDisplay("");
      setKeterangan("");
      setBuktiFotoUrl("");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) {
      setNominal(0);
      setNominalDisplay("");
      return;
    }
    const val = parseInt(raw, 10);
    setNominal(val);
    setNominalDisplay(val.toLocaleString("id-ID"));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setBuktiFotoUrl(data.url);
      } else {
        alert("Gagal mengunggah foto bukti.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      setErrorMsg("Nominal harus lebih dari 0.");
      return;
    }
    if (!keterangan.trim()) {
      setErrorMsg("Uraian / Keterangan wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        tanggal,
        jenis,
        kategoriKas,
        nominal,
        keterangan: keterangan.trim(),
        buktiFotoUrl: buktiFotoUrl || null,
      };

      const url = initialData?.id
        ? `/api/keuangan/${initialData.id}`
        : "/api/keuangan";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan transaksi.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData?.id ? "Edit Transaksi Kas" : "Catat Transaksi Kas Masjid"}
            </h2>
            <p className="text-xs text-slate-500">
              Pilih jenis transaksi dan kantong kas (Jariyah / Infaq-Shodaqoh).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* 1. Toggle Jenis Transaksi: Pemasukan / Pengeluaran */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJenis("MASUK")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold border transition ${
                  jenis === "MASUK"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Pemasukan (Uang Masuk)</span>
              </button>

              <button
                type="button"
                onClick={() => setJenis("KELUAR")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold border transition ${
                  jenis === "KELUAR"
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pengeluaran (Uang Keluar)</span>
              </button>
            </div>
          </div>

          {/* 2. Kategori Kas: Kas Jariyah vs Kas Infaq */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Kategori Kantong Kas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKategoriKas("JARIYAH")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition ${
                  kategoriKas === "JARIYAH"
                    ? "bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <Landmark className="w-4 h-4 text-teal-600" />
                  <span>Kas Jariyah</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Pembangunan, renovasi gedung, inventaris besar & aset fisik.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setKategoriKas("INFAQ")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition ${
                  kategoriKas === "INFAQ"
                    ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Kas Infaq / Shodaqoh</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Operasional harian, listrik/air, kebersihan, konsumsi kajian & sosial.
                </span>
              </button>
            </div>
          </div>

          {/* 3. Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal Transaksi (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  value={nominalDisplay}
                  onChange={handleNominalChange}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          {/* 4. Keterangan / Uraian */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keterangan / Uraian Transaksi
            </label>
            <textarea
              required
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Sumbangan semen 50 sak dari H. Budi, atau Pembayaran tagihan listrik PLN bulan ini"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* 5. Upload Bukti Foto Nota / Kwitansi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Upload Foto Bukti Nota / Kwitansi (Opsional)
            </label>
            {buktiFotoUrl ? (
              <div className="relative w-fit border border-slate-200 rounded-2xl p-2 bg-slate-50 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buktiFotoUrl}
                  alt="Bukti Transaksi"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <span className="text-xs font-semibold text-emerald-700 block">
                    Foto bukti tersimpan
                  </span>
                  <button
                    type="button"
                    onClick={() => setBuktiFotoUrl("")}
                    className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
                />
                {uploading && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Menyimpan..." : "Simpan Transaksi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
