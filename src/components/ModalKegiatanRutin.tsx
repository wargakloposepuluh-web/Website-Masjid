"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Clock, MapPin, User, Users, AlertCircle, Loader2, Calendar } from "lucide-react";

interface ModalKegiatanRutinProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTipe?: "MINGGUAN" | "BULANAN";
  editingItem?: any | null;
}

export default function ModalKegiatanRutin({
  isOpen,
  onClose,
  onSuccess,
  defaultTipe = "MINGGUAN",
  editingItem,
}: ModalKegiatanRutinProps) {
  const [tipe, setTipe] = useState<"MINGGUAN" | "BULANAN">(defaultTipe);
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [hari, setHari] = useState("");
  const [waktu, setWaktu] = useState("");
  const [tempat, setTempat] = useState("Ruang Utama Masjid Baitul Maghfirah");
  const [pengisi, setPengisi] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [siklusBulanan, setSiklusBulanan] = useState("");
  const [sasaranPeserta, setSasaranPeserta] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingItem) {
      setTipe(editingItem.tipe || defaultTipe);
      setNamaKegiatan(editingItem.namaKegiatan || "");
      setHari(editingItem.hari || "");
      setWaktu(editingItem.waktu || "");
      setTempat(editingItem.tempat || "Ruang Utama Masjid Baitul Maghfirah");
      setPengisi(editingItem.pengisi || "");
      setPenanggungJawab(editingItem.penanggungJawab || "");
      setSiklusBulanan(editingItem.siklusBulanan || "");
      setSasaranPeserta(editingItem.sasaranPeserta || "");
      setKeterangan(editingItem.keterangan || "");
      setIsActive(editingItem.isActive !== undefined ? editingItem.isActive : true);
    } else {
      setTipe(defaultTipe);
      setNamaKegiatan("");
      setHari(defaultTipe === "MINGGUAN" ? "Kamis Malam (Malam Jum'at)" : "Ahad Pekan Pertama");
      setWaktu(defaultTipe === "MINGGUAN" ? "Ba'da Isya' - Selesai" : "06.00 - 08.00 WIB");
      setTempat("Ruang Utama Masjid Baitul Maghfirah");
      setPengisi("");
      setPenanggungJawab("Sie Dakwah / Takmir");
      setSiklusBulanan(defaultTipe === "BULANAN" ? "Ahad Pekan ke-1" : "");
      setSasaranPeserta("Jamaah Umum");
      setKeterangan("");
      setIsActive(true);
    }
    setErrorMsg("");
  }, [editingItem, defaultTipe, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan.trim()) {
      setErrorMsg("Nama kegiatan wajib diisi.");
      return;
    }
    if (!hari.trim() || !waktu.trim()) {
      setErrorMsg("Hari dan Waktu pelaksanaan wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        tipe,
        namaKegiatan: namaKegiatan.trim(),
        hari: hari.trim(),
        waktu: waktu.trim(),
        tempat: tempat.trim(),
        pengisi: pengisi.trim() || null,
        penanggungJawab: penanggungJawab.trim() || null,
        siklusBulanan: tipe === "BULANAN" ? siklusBulanan.trim() || null : null,
        sasaranPeserta: sasaranPeserta.trim() || null,
        keterangan: keterangan.trim() || null,
        isActive,
      };

      const url = editingItem ? `/api/kegiatan/rutin/${editingItem.id}` : "/api/kegiatan/rutin";
      const method = editingItem ? "PUT" : "POST";

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
        setErrorMsg(data.error || "Gagal menyimpan kegiatan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{editingItem ? "Ubah Jadwal Kegiatan" : `Tambah Kegiatan ${tipe === "MINGGUAN" ? "Mingguan" : "Bulanan"}`}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola jadwal kegiatan rutin dan pengisi acara Masjid Baitul Maghfirah.
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
          {/* Tipe Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Jenis Frekuensi Kegiatan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipe("MINGGUAN")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  tipe === "MINGGUAN"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Kegiatan Mingguan
              </button>
              <button
                type="button"
                onClick={() => setTipe("BULANAN")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  tipe === "BULANAN"
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Kegiatan Bulanan
              </button>
            </div>
          </div>

          {/* Nama Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              placeholder="Contoh: Pembacaan Maulid Diba', Pengajian Ahad Pagi, Khotmil Qur'an, Kerja Bakti"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold text-slate-900"
            />
          </div>

          {/* Hari & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hari Pelaksanaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                placeholder="Contoh: Kamis Malam, Ahad Pagi, Sabtu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Waktu / Jam <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  placeholder="Contoh: Ba'da Isya' - Selesai"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Siklus Bulanan (Jika Tipe === BULANAN) */}
          {tipe === "BULANAN" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Siklus Pelaksanaan Bulanan
              </label>
              <input
                type="text"
                value={siklusBulanan}
                onChange={(e) => setSiklusBulanan(e.target.value)}
                placeholder="Contoh: Ahad Pekan Pertama, Jum'at Kliwon, Pekan Terakhir"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          )}

          {/* Pengisi / Penceramah & Penanggung Jawab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pengisi / Penceramah
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={pengisi}
                  onChange={(e) => setPengisi(e.target.value)}
                  placeholder="Contoh: Ustadz H. Ahmad Syarifuddin"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Penanggung Jawab / Sie
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  placeholder="Contoh: Sie Peribadatan / Remas"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Tempat & Sasaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lokasi / Tempat
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={tempat}
                  onChange={(e) => setTempat(e.target.value)}
                  placeholder="Contoh: Ruang Utama Masjid"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sasaran Peserta
              </label>
              <input
                type="text"
                value={sasaranPeserta}
                onChange={(e) => setSasaranPeserta(e.target.value)}
                placeholder="Contoh: Jamaah Umum, Ibu-ibu, Remaja"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan Tambahan / Detail Acara
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Pembacaan kitab Maulid dilanjutkan ramah tamah dan tahlil..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
            />
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Kegiatan ini Berstatus Aktif / Berjalan Rutin
            </label>
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
                  <span>{editingItem ? "Simpan Perubahan" : "Tambah Kegiatan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
