"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  PlusCircle,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";
import ModalKegiatanRutin from "@/components/ModalKegiatanRutin";

interface KegiatanItem {
  id: number;
  tipe: "MINGGUAN" | "BULANAN";
  namaKegiatan: string;
  hari: string;
  waktu: string;
  tempat: string;
  pengisi?: string | null;
  penanggungJawab?: string | null;
  siklusBulanan?: string | null;
  sasaranPeserta?: string | null;
  keterangan?: string | null;
  isActive: boolean;
}

export default function KegiatanBulananPage() {
  const [items, setItems] = useState<KegiatanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KegiatanItem | null>(null);

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kegiatan/rutin?tipe=BULANAN");
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/kegiatan/rutin/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchKegiatan();
      } else {
        alert("Gagal menghapus kegiatan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1450px] mx-auto space-y-6 text-[#111317]">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-600" />
            <span>Jadwal Kegiatan Bulanan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Khotmil Qur&apos;an, santunan yatim, kerja bakti, dan agenda dakwah yang terlaksana secara berkala setiap bulan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Jadwal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Kegiatan Bulanan</span>
          </button>
        </div>
      </div>

      {/* Cetak Kop Laporan */}
      <div className="hidden print:block mb-6 text-center border-b-2 border-black pb-4">
        <h2 className="text-xl font-bold uppercase tracking-wider">MASJID BAITUL MAGHFIRAH</h2>
        <p className="text-xs text-slate-600">Kloposepuluh, Sukodono, Sidoarjo, Jawa Timur</p>
        <h3 className="text-base font-bold mt-2 underline">
          JADWAL KEGIATAN RUTIN BULANAN MASJID
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dicetak pada: {formatIndoDate(new Date())}
        </p>
      </div>

      {/* Grid Cards Kegiatan */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat kegiatan bulanan...</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white/50 rounded-3xl border border-white/70">
          Belum ada kegiatan bulanan yang dicatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 uppercase">
                    {item.siklusBulanan || "Bulanan"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.isActive ? "Aktif Berjalan" : "Non-Aktif"}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {item.namaKegiatan}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">{item.hari}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{item.waktu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="truncate">{item.tempat}</span>
                  </div>
                </div>

                {item.pengisi && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[10px]">Pengisi / Penanggung:</span>
                    <span className="font-bold text-slate-800">{item.pengisi}</span>
                  </div>
                )}

                {item.keterangan && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                    &ldquo;{item.keterangan}&rdquo;
                  </p>
                )}
              </div>

              <div className="no-print pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Peserta: {item.sasaranPeserta || "Umum"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition"
                    title="Edit Kegiatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.namaKegiatan)}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    title="Hapus Kegiatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lembar Tanda Tangan Cetak */}
      <div className="hidden print:flex justify-between items-center text-xs mt-10 pt-6 px-4">
        <div className="text-center">
          <p>Mengetahui,</p>
          <p className="font-bold mt-1">Ketua Masjid Baitul Maghfirah</p>
          <div className="h-16" />
          <p className="font-bold underline">H. Ahmad Syarifuddin, S.Ag.</p>
        </div>
        <div className="text-center">
          <p>Sidoarjo, {formatIndoDate(new Date())}</p>
          <p className="font-bold mt-1">Sie Peribadatan & Dakwah</p>
          <div className="h-16" />
          <p className="font-bold underline">Ustadz Muhammad Rizqi, M.Pd.</p>
        </div>
      </div>

      <ModalKegiatanRutin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchKegiatan}
        defaultTipe="BULANAN"
        editingItem={editingItem}
      />
    </div>
  );
}
