"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import GrafikRekapTahunan, { RekapTahunanData } from "@/components/GrafikRekapTahunan";

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

export default function KeuanganGrafikPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchStats = async (yr?: number) => {
    setLoading(true);
    try {
      const yearToFetch = yr !== undefined ? yr : selectedYear;
      const res = await fetch(`/api/keuangan/stats?year=${yearToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Gagal load data statistik tahunan:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedYear);
  }, [selectedYear]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Bar / Menu */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/60">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Quick tab toggle between Buku Kas & Grafik */}
          <div className="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/70 backdrop-blur-md">
            <Link
              href="/keuangan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Kas</span>
            </Link>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16171b] text-white shadow-xs">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grafik</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchStats(selectedYear)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/60 hover:bg-white border border-white/80 text-xs font-semibold text-slate-700 shadow-sm transition backdrop-blur-md"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <Link
            href="/keuangan/catat"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Kas Baru</span>
          </Link>
        </div>
      </div>

      {/* Komponen Grafik Rekapitulasi Tahunan Kas Masjid */}
      <GrafikRekapTahunan
        data={stats?.rekapTahunan}
        availableYears={
          stats?.availableYears && stats.availableYears.length > 0
            ? stats.availableYears
            : Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i)
        }
        selectedYear={selectedYear}
        onYearChange={(yr) => setSelectedYear(yr)}
        loading={loading}
      />
    </div>
  );
}
