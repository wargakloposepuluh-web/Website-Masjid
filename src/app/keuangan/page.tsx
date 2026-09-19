"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  HeartHandshake,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Printer,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  Coins,
  FileText,
  QrCode,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";
import ModalTransaksiKeuangan from "@/components/ModalTransaksiKeuangan";
import ModalBuktiFoto from "@/components/ModalBuktiFoto";
import type { RekapTahunanData } from "@/components/GrafikRekapTahunan";
import ModalCetakLaporanKas from "@/components/ModalCetakLaporanKas";

interface TransaksiItem {
  id: number;
  tanggal: string;
  jenis: "MASUK" | "KELUAR";
  kategoriKas: "JARIYAH" | "INFAQ";
  nominal: number;
  keterangan: string;
  buktiFotoUrl?: string | null;
  dicatatOleh?: string | null;
}

interface StatsData {
  saldoJariyah: number;
  saldoInfaq: number;
  totalSaldo: number;
  totalMasukJariyah: number;
  totalKeluarJariyah: number;
  totalMasukInfaq: number;
  totalKeluarInfaq: number;
  masukBulanIni: number;
  keluarBulanIni: number;
  rekapTahunan?: RekapTahunanData;
  availableYears?: number[];
}

export default function KeuanganPage() {
  const [items, setItems] = useState<TransaksiItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pilihan Tahun untuk Rekapitulasi Tahunan Grafik
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Filters
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [jenisFilter, setJenisFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiItem | null>(null);
  const [viewingBukti, setViewingBukti] = useState<{ url: string; ket: string } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchSetting = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSetting(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  useEffect(() => {
    const handleBeforePrint = () => {
      setIsPrintModalOpen(true);
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, []);

  const fetchStats = async (yr?: number) => {
    try {
      const yearToFetch = yr !== undefined ? yr : selectedYear;
      const res = await fetch(`/api/keuangan/stats?year=${yearToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (kategoriFilter !== "all") params.append("kategori", kategoriFilter);
      if (jenisFilter !== "all") params.append("jenis", jenisFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/keuangan?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    fetchTransaksi();
  }, [kategoriFilter, jenisFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransaksi();
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TransaksiItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number, ket: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus catatan transaksi: "${ket}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/keuangan/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransaksi();
        fetchStats(selectedYear);
      } else {
        alert("Gagal menghapus transaksi.");
      }
    } catch (e) {
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  // Format Rupiah
  const formatRp = (num: number) => {
    return "Rp " + (num || 0).toLocaleString("id-ID");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Top Navigation Menu: Buku Kas vs Grafik */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/60">
        <div className="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/70 backdrop-blur-md">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#16171b] text-white shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buku Kas</span>
          </span>
          <Link
            href="/keuangan/grafik"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik</span>
          </Link>
        </div>

        <Link
          href="/keuangan/catat"
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Catat Kas Baru</span>
        </Link>
      </div>

      {/* 3. Ringkasan Saldo Kas (3 Kartu Statistik) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Kas Jariyah */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 shadow-md shadow-slate-900/5 flex flex-col justify-between space-y-3 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
              <Landmark className="w-4 h-4" />
              <span>Kas Jariyah</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-bold border border-teal-200">
              Pembangunan
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Saldo Kas Jariyah:</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              {stats ? formatRp(stats.saldoJariyah) : "..."}
            </h3>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="text-emerald-700 font-bold">
              + {stats ? formatRp(stats.totalMasukJariyah) : "..."}
            </span>
            <span className="text-rose-600 font-bold">
              - {stats ? formatRp(stats.totalKeluarJariyah) : "..."}
            </span>
          </div>
        </div>

        {/* Card 2: Kas Infaq / Shodaqoh */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 shadow-md shadow-slate-900/5 flex flex-col justify-between space-y-3 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Kas Infaq / Shodaqoh</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Operasional
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Saldo Kas Infaq:</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              {stats ? formatRp(stats.saldoInfaq) : "..."}
            </h3>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="text-emerald-700 font-bold">
              + {stats ? formatRp(stats.totalMasukInfaq) : "..."}
            </span>
            <span className="text-rose-600 font-bold">
              - {stats ? formatRp(stats.totalKeluarInfaq) : "..."}
            </span>
          </div>
        </div>

        {/* Card 3: Total Kas Keseluruhan */}
        <div className="bg-gradient-to-br from-emerald-900 to-[#16171b] text-white rounded-3xl p-5 shadow-lg shadow-emerald-950/20 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>Total Uang Kas</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-800/80 text-emerald-200 font-semibold border border-emerald-700/50">
              Semua Kas
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-emerald-200/70">Total Saldo Terkini:</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
              {stats ? formatRp(stats.totalSaldo) : "..."}
            </h3>
          </div>
          <div className="pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-200/80 flex items-center justify-between">
            <span>Jariyah: {stats ? formatRp(stats.saldoJariyah) : "..."}</span>
            <span>Infaq: {stats ? formatRp(stats.saldoInfaq) : "..."}</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Toolbar */}
      <div className="no-print bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-900/5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 flex-1 min-w-[280px]"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari uraian transaksi atau keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#16171b] text-white text-xs font-semibold rounded-2xl hover:bg-black transition shadow-sm"
            >
              Cari
            </button>
          </form>

          {/* Filter Kategori Kas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">Kas:</span>
            {[
              { id: "all", label: "Semua Kas" },
              { id: "JARIYAH", label: "Kas Jariyah" },
              { id: "INFAQ", label: "Kas Infaq / Shodaqoh" },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKategoriFilter(k.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition ${
                  kategoriFilter === k.id
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          {/* Filter Jenis: Masuk / Keluar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">Jenis:</span>
            {[
              { id: "all", label: "Semua" },
              { id: "MASUK", label: "Pemasukan (+)" },
              { id: "KELUAR", label: "Pengeluaran (-)" },
            ].map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setJenisFilter(j.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition ${
                  jenisFilter === j.id
                    ? "bg-slate-900 text-white shadow-sm font-bold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Picker & Tombol Cetak Laporan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold flex items-center gap-1 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Rentang Tanggal:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            />
            <span className="font-semibold text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            />
            {(startDate || endDate || search || kategoriFilter !== "all" || jenisFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearch("");
                  setKategoriFilter("all");
                  setJenisFilter("all");
                }}
                className="text-[11px] text-red-600 font-bold hover:underline ml-1"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-md shadow-emerald-700/20 transition active:scale-95"
              title="Cetak Laporan Keuangan"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Kas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tabel Riwayat Transaksi (Ledger) */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Header Kotak Tabel Rekapitulasi */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Tabel Rekapitulasi Kas Masjid
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Pencatatan rincian mutasi kas masuk & keluar (Kas Jariyah & Kas Infaq)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-xs">
              Total: <strong className="text-emerald-700 font-extrabold">{items.length}</strong> Transaksi
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-4 w-12 text-center">No</th>
                <th className="py-4 px-4">Tanggal</th>
                <th className="py-4 px-4">Jenis</th>
                <th className="py-4 px-4">Kategori Kas</th>
                <th className="py-4 px-4">Uraian / Keterangan</th>
                <th className="py-4 px-4 text-center">Bukti Nota</th>
                <th className="py-4 px-4 text-right">Nominal (Rp)</th>
                <th className="no-print py-4 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat riwayat transaksi kas...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-10 h-10 text-slate-300" />
                      <p className="font-bold text-slate-700">Tidak ada transaksi kas yang sesuai</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau sesuaikan filter Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const isMasuk = item.jenis === "MASUK";
                  const isJariyah = item.kategoriKas === "JARIYAH";

                  return (
                    <tr key={item.id} className="even:bg-slate-50/50 hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {formatIndoDate(item.tanggal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-xs ${
                            isMasuk
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {isMasuk ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Masuk</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-700" />
                              <span>Keluar</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-xs ${
                            isJariyah
                              ? "bg-teal-100 text-teal-800 border-teal-300"
                              : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                        >
                          {isJariyah ? "Kas Jariyah" : "Kas Infaq"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{item.keterangan}</div>
                        {item.dicatatOleh && (
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Oleh: {item.dicatatOleh}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.buktiFotoUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingBukti({
                                url: item.buktiFotoUrl!,
                                ket: item.keterangan,
                              })
                            }
                            className="p-1 rounded-xl hover:bg-slate-100 transition inline-block border border-slate-300 shadow-xs hover:scale-105"
                            title="Klik untuk lihat foto nota"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.buktiFotoUrl}
                              alt="Nota"
                              className="w-9 h-9 object-cover rounded-lg"
                            />
                          </button>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs sm:text-sm inline-block border font-mono font-extrabold ${
                            isMasuk
                              ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                              : "text-rose-800 bg-rose-50 border-rose-200"
                          }`}
                        >
                          {isMasuk ? "+ " : "- "}
                          {formatRp(item.nominal)}
                        </span>
                      </td>
                      <td className="no-print py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/keuangan/catat?id=${item.id}`}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition shadow-xs"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.keterangan)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition shadow-xs"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modals */}
      <ModalCetakLaporanKas
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={items}
        stats={stats}
        setting={setting}
        filterKategori={kategoriFilter}
        filterJenis={jenisFilter}
        startDate={startDate}
        endDate={endDate}
      />

      <ModalTransaksiKeuangan
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchTransaksi();
          fetchStats(selectedYear);
        }}
        initialData={editingItem}
      />

      {viewingBukti && (
        <ModalBuktiFoto
          imageUrl={viewingBukti.url}
          keterangan={viewingBukti.ket}
          onClose={() => setViewingBukti(null)}
        />
      )}
    </div>
  );
}
