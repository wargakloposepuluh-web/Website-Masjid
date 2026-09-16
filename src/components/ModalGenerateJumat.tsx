"use client";

import React, { useState } from "react";
import { X, Calendar, Sparkles, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface ModalGenerateJumatProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTahun?: number;
}

export default function ModalGenerateJumat({
  isOpen,
  onClose,
  onSuccess,
  initialTahun = new Date().getFullYear(),
}: ModalGenerateJumatProps) {
  const [tahun, setTahun] = useState(initialTahun);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/kegiatan/jumat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahun: Number(tahun) }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || `Berhasil generate jadwal Jum'at tahun ${tahun}`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Gagal generate jadwal Jum'at.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Generate Jadwal Jum&apos;at 1 Tahun
              </h3>
              <p className="text-[11px] text-slate-500">
                Otomatisasi tanggal Jum&apos;at setahun penuh
              </p>
            </div>
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

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Tahun Jadwal
            </label>
            <div className="relative">
              <input
                type="number"
                min={2024}
                max={2035}
                required
                value={tahun}
                onChange={(e) => setTahun(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-bold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Sistem akan secara otomatis menghitung seluruh tanggal hari Jum&apos;at (sekitar 52-53 Jum&apos;at) dalam tahun {tahun}. Tanggal yang sudah ada tidak akan diduplikasi.
            </p>
          </div>

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
                  <span>Menghasilkan Tanggal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Generate {tahun}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
