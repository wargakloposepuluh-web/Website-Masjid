"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Calendar, UserCheck, Mic2, Megaphone, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { formatIndoDate } from "@/lib/utils";

interface ModalEditJadwalJumatProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jadwal: any | null;
}

export default function ModalEditJadwalJumat({
  isOpen,
  onClose,
  onSuccess,
  jadwal,
}: ModalEditJadwalJumatProps) {
  const [khotib, setKhotib] = useState("");
  const [imam, setImam] = useState("");
  const [bilal, setBilal] = useState("");
  const [pembacaPengumuman, setPembacaPengumuman] = useState("");
  const [temaKhutbah, setTemaKhutbah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (jadwal) {
      setKhotib(jadwal.khotib || "");
      setImam(jadwal.imam || "");
      setBilal(jadwal.bilal || "");
      setPembacaPengumuman(jadwal.pembacaPengumuman || "");
      setTemaKhutbah(jadwal.temaKhutbah || "");
      setKeterangan(jadwal.keterangan || "");
    }
    setErrorMsg("");
  }, [jadwal, isOpen]);

  if (!isOpen || !jadwal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/kegiatan/jumat/${jadwal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          khotib: khotib.trim(),
          imam: imam.trim() || khotib.trim(),
          bilal: bilal.trim(),
          pembacaPengumuman: pembacaPengumuman.trim(),
          temaKhutbah: temaKhutbah.trim(),
          keterangan: keterangan.trim(),
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan jadwal Jum'at");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Petugas Sholat Jum&apos;at</span>
            </h3>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              Jum&apos;at, {formatIndoDate(jadwal.tanggal)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Khotib */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Khotib Jum&apos;at
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="text"
                value={khotib}
                onChange={(e) => {
                  setKhotib(e.target.value);
                  if (!imam) setImam(e.target.value);
                }}
                placeholder="Contoh: KH. Nurul Huda Al-Hafidz"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* 2. Imam */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Imam Sholat Jum&apos;at
            </label>
            <input
              type="text"
              value={imam}
              onChange={(e) => setImam(e.target.value)}
              placeholder="Contoh: Sama dengan Khotib / Ustadz lain"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
            />
          </div>

          {/* 3. Bilal / Muroqqi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Bilal / Muroqqi
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mic2 className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="text"
                value={bilal}
                onChange={(e) => setBilal(e.target.value)}
                placeholder="Contoh: Ust. Agus Santoso"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* 4. Pembaca Pengumuman */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4. Pembaca Pengumuman / MC
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Megaphone className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="text"
                value={pembacaPengumuman}
                onChange={(e) => setPembacaPengumuman(e.target.value)}
                placeholder="Contoh: Bpk. Suwandi / Pengurus Takmir"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* 5. Tema Khutbah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              5. Tema / Judul Khutbah (Opsional)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={temaKhutbah}
                onChange={(e) => setTemaKhutbah(e.target.value)}
                placeholder="Contoh: Menjaga Ukhuwah dan Silaturahmi"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* 6. Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              6. Catatan / Status Konfirmasi
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Sudah konfirmasi WA / Petugas cadangan: Ust. Z"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Petugas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
