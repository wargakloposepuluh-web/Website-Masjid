"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Printer,
  Search,
  UserCheck,
  Clock,
  Edit2,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";
import ModalEditJadwalJumat from "@/components/ModalEditJadwalJumat";
import ModalGenerateJumat from "@/components/ModalGenerateJumat";

interface JadwalJumatItem {
  id: number;
  tanggal: string;
  tahun: number;
  khotib?: string | null;
  imam?: string | null;
  bilal?: string | null;
  pembacaPengumuman?: string | null;
  temaKhutbah?: string | null;
  keterangan?: string | null;
}

export default function JadwalJumatPage() {
  const currentYear = new Date().getFullYear();
  const [tahunJumat, setTahunJumat] = useState<number>(currentYear);
  const [bulanJumat, setBulanJumat] = useState<string>("all");
  const [searchJumat, setSearchJumat] = useState<string>("");
  const [jumatList, setJumatList] = useState<JadwalJumatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedJumat, setSelectedJumat] = useState<JadwalJumatItem | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchJumat = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tahun", String(tahunJumat));
      if (bulanJumat !== "all") {
        params.append("bulan", bulanJumat);
      }
      const res = await fetch(`/api/kegiatan/jumat?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJumatList(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJumat();
  }, [tahunJumat, bulanJumat]);

  const handleCopyWaReminder = (item: JadwalJumatItem) => {
    const tgl = formatIndoDate(item.tanggal);
    const text = `*PENGINGAT PETUGAS SHOLAT JUM'AT*
*MASJID BAITUL MAGHFIRAH*
Kloposepuluh, Sukodono, Sidoarjo

Hari, Tanggal: *Jum'at, ${tgl}*
Waktu: Pukul 11.30 WIB - Selesai

*SUSUNAN PETUGAS:*
• *Khotib:* ${item.khotib || "Belum ditentukan"}
• *Imam:* ${item.imam || item.khotib || "Belum ditentukan"}
• *Bilal / Muroqqi:* ${item.bilal || "Belum ditentukan"}
• *MC / Pembaca Pengumuman:* ${item.pembacaPengumuman || "Pengurus Takmir"}
${item.temaKhutbah ? `• *Tema Khutbah:* "${item.temaKhutbah}"\n` : ""}
Mohon konfirmasi kesiapan bapak/ustadz sekalian dan hadir 15 menit sebelum adzan dikumandangkan. Semoga Allah SWT memudahkan segala urusan kita.

_Wassalamu'alaikum Warahmatullahi Wabarakatuh._
*Takmir Masjid Baitul Maghfirah*`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const filteredJumat = jumatList.filter((item) => {
    if (!searchJumat.trim()) return true;
    const q = searchJumat.toLowerCase();
    return (
      (item.khotib && item.khotib.toLowerCase().includes(q)) ||
      (item.imam && item.imam.toLowerCase().includes(q)) ||
      (item.bilal && item.bilal.toLowerCase().includes(q)) ||
      (item.pembacaPengumuman && item.pembacaPengumuman.toLowerCase().includes(q)) ||
      (item.temaKhutbah && item.temaKhutbah.toLowerCase().includes(q))
    );
  });

  const totalJumatYear = jumatList.length;
  const filledKhotib = jumatList.filter((item) => !!item.khotib).length;
  const emptyKhotib = totalJumatYear - filledKhotib;

  const namaBulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1450px] mx-auto space-y-6 text-[#111317]">
      {/* 1. Header Halaman */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Jadwal Petugas Sholat Jum&apos;at</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengaturan dan rekap tahunan petugas Khotib, Imam, Bilal, dan Pembaca Pengumuman Sholat Jum&apos;at.
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
            onClick={() => setIsGenerateOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate 1 Tahun ({tahunJumat})</span>
          </button>
        </div>
      </div>

      {/* 2. Cetak Kop Laporan (Hanya muncul saat print) */}
      <div className="hidden print:block mb-6 text-center border-b-2 border-black pb-4">
        <h2 className="text-xl font-bold uppercase tracking-wider">MASJID BAITUL MAGHFIRAH</h2>
        <p className="text-xs text-slate-600">Kloposepuluh, Sukodono, Sidoarjo, Jawa Timur</p>
        <h3 className="text-base font-bold mt-2 underline">
          JADWAL PETUGAS SHOLAT JUM&apos;AT TAHUN {tahunJumat}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dicetak pada: {formatIndoDate(new Date())}
        </p>
      </div>

      {/* 4. 3 Kartu Ringkasan Statistik */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Jum&apos;at ({tahunJumat})</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalJumatYear} Hari</h3>
            <p className="text-[11px] text-slate-500 mt-1">Setahun penuh terjadwal</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Sudah Terisi Khotib</span>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-0.5">{filledKhotib} Jum&apos;at</h3>
            <p className="text-[11px] text-slate-500 mt-1">Petugas terkonfirmasi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Belum Ditentukan</span>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{emptyKhotib} Jum&apos;at</h3>
            <p className="text-[11px] text-slate-500 mt-1">Perlu penetapan khotib</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5. Filter & Toolbar */}
      <div className="no-print bg-white/50 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
          {/* Tahun Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Tahun:</span>
            <select
              value={tahunJumat}
              onChange={(e) => setTahunJumat(parseInt(e.target.value, 10))}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchJumat}
              onChange={(e) => setSearchJumat(e.target.value)}
              placeholder="Cari Khotib, Bilal, atau MC..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Bulan Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex-shrink-0">Bulan:</span>
          <button
            type="button"
            onClick={() => setBulanJumat("all")}
            className={`px-3 py-1 rounded-xl font-semibold flex-shrink-0 transition ${
              bulanJumat === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Semua Bulan
          </button>
          {namaBulanIndo.map((nama, idx) => {
            const bVal = String(idx + 1);
            const isSelected = bulanJumat === bVal;
            return (
              <button
                key={bVal}
                type="button"
                onClick={() => setBulanJumat(bVal)}
                className={`px-2.5 py-1 rounded-xl font-semibold flex-shrink-0 transition ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {nama.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Tabel Jadwal Jum'at */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Jum&apos;at</th>
                <th className="py-3.5 px-4">Khotib & Imam</th>
                <th className="py-3.5 px-4">Bilal / Muroqqi</th>
                <th className="py-3.5 px-4">Pembaca Pengumuman</th>
                <th className="py-3.5 px-4">Tema Khutbah</th>
                <th className="no-print py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat jadwal sholat Jum&apos;at...
                  </td>
                </tr>
              ) : filteredJumat.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <p>Belum ada jadwal Jum&apos;at untuk filter tahun / bulan ini.</p>
                    <button
                      type="button"
                      onClick={() => setIsGenerateOpen(true)}
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Jadwal Jum&apos;at Tahun {tahunJumat}</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredJumat.map((item, idx) => {
                  const isComplete = item.khotib && item.bilal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{formatIndoDate(item.tanggal)}</span>
                          {!isComplete && (
                            <span className="no-print w-2 h-2 rounded-full bg-amber-400" title="Belum lengkap" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.khotib ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{item.khotib}</span>
                            {item.imam && item.imam !== item.khotib && (
                              <span className="text-[11px] text-slate-400 block">
                                Imam: {item.imam}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium italic text-xs">
                            Belum Ditentukan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.bilal || <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.pembacaPengumuman || <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">
                        {item.temaKhutbah ? (
                          <span title={item.temaKhutbah}>&ldquo;{item.temaKhutbah}&rdquo;</span>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                      <td className="no-print py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJumat(item);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition"
                            title="Edit Petugas Jum'at"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyWaReminder(item)}
                            className={`p-1.5 rounded-xl transition ${
                              copiedId === item.id
                                ? "bg-emerald-100 text-emerald-800"
                                : "hover:bg-slate-100 text-slate-400 hover:text-emerald-600"
                            }`}
                            title="Salin Pesan Pengingat WhatsApp"
                          >
                            {copiedId === item.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Modals */}
      <ModalEditJadwalJumat
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchJumat}
        jadwal={selectedJumat}
      />

      <ModalGenerateJumat
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchJumat}
        initialTahun={tahunJumat}
      />
    </div>
  );
}
