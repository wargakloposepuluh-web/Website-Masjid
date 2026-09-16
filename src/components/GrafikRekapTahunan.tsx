"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Coins,
  Landmark,
  HeartHandshake,
  Info,
  ChevronDown,
} from "lucide-react";

export interface MonthlyData {
  bulanIndex: number;
  namaBulan: string;
  singkat: string;
  masukJariyah: number;
  keluarJariyah: number;
  masukInfaq: number;
  keluarInfaq: number;
  totalMasuk: number;
  totalKeluar: number;
  surplus: number;
}

export interface RekapTahunanData {
  tahun: number;
  totalMasukTahunan: number;
  totalKeluarTahunan: number;
  totalMasukJariyahTahunan: number;
  totalKeluarJariyahTahunan: number;
  totalMasukInfaqTahunan: number;
  totalKeluarInfaqTahunan: number;
  surplusTahunan: number;
  monthlyData: MonthlyData[];
}

interface GrafikRekapTahunanProps {
  data?: RekapTahunanData | null;
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  loading?: boolean;
}

type KasViewMode = "SEMUA" | "JARIYAH" | "INFAQ" | "KOMPARASI";

export default function GrafikRekapTahunan({
  data,
  availableYears,
  selectedYear,
  onYearChange,
  loading = false,
}: GrafikRekapTahunanProps) {
  const [kasMode, setKasMode] = useState<KasViewMode>("SEMUA");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const formatRp = (num: number) => {
    return "Rp " + (num || 0).toLocaleString("id-ID");
  };

  const formatShortRp = (num: number) => {
    if (!num || num === 0) return "Rp 0";
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(1).replace(/\.0$/, "")} M`;
    }
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1).replace(/\.0$/, "")} Jt`;
    }
    if (num >= 1000) {
      return `Rp ${(num / 1000).toFixed(0)} Rb`;
    }
    return `Rp ${num}`;
  };

  const monthlyList = data?.monthlyData || [];

  // Hitung nilai maksimum untuk skala grafik berdasarkan mode yang dipilih
  const maxVal = Math.max(
    ...monthlyList.map((m) => {
      if (kasMode === "SEMUA") {
        return Math.max(m.totalMasuk, m.totalKeluar);
      } else if (kasMode === "JARIYAH") {
        return Math.max(m.masukJariyah, m.keluarJariyah);
      } else if (kasMode === "INFAQ") {
        return Math.max(m.masukInfaq, m.keluarInfaq);
      } else {
        // KOMPARASI
        return Math.max(m.masukJariyah, m.keluarJariyah, m.masukInfaq, m.keluarInfaq);
      }
    }),
    500000 // minimal threshold agar skala tetap proporsional
  );

  // 4 Level Sumbu Y
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(maxVal * ratio));

  // Current date indicators
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  // Active month info to display (either hovered or the most active / current month)
  const activeMonthIdx =
    hoveredMonth !== null
      ? hoveredMonth
      : selectedYear === currentYear
      ? currentMonthIdx
      : 8; // default September or first with data
  const activeMonthData = monthlyList[activeMonthIdx] || null;

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-6">
      {/* 1. Header Grafik & Pilihan Tahun */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Grafik Rekapitulasi Tahunan Kas Masjid
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 font-bold border border-emerald-200">
                  Tahun {selectedYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualisasi komparasi perputaran dana masuk dan keluar antara Kas Jariyah & Kas Infaq per bulan.
              </p>
            </div>
          </div>
        </div>

        {/* Kontrol: Pilihan Tahun & Filter Kas */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pilihan Tahun Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm transition">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-white text-xs sm:text-sm font-bold text-slate-900 rounded-xl px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-xs"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === currentYear ? "(Tahun Ini)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Pilihan Kas Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            {[
              { id: "SEMUA", label: "Semua Kas" },
              { id: "JARIYAH", label: "Kas Jariyah" },
              { id: "INFAQ", label: "Kas Infaq" },
              { id: "KOMPARASI", label: "Bandingkan Kas" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setKasMode(tab.id as KasViewMode)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  kasMode === tab.id
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Kartu Rangkuman Angka Tahunan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Total Pemasukan Tahun Ini */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 rounded-2xl p-4 border border-emerald-200/70 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Total Pemasukan ({selectedYear})</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold">
              + Masuk
            </span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {data ? formatRp(data.totalMasukTahunan) : "..."}
            </h3>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
            <span>Jariyah: {data ? formatRp(data.totalMasukJariyahTahunan) : "..."}</span>
            <span>Infaq: {data ? formatRp(data.totalMasukInfaqTahunan) : "..."}</span>
          </div>
        </div>

        {/* Total Pengeluaran Tahun Ini */}
        <div className="bg-gradient-to-br from-rose-50/70 to-rose-100/30 rounded-2xl p-4 border border-rose-200/70 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Total Pengeluaran ({selectedYear})</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold">
              - Keluar
            </span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-rose-950">
              {data ? formatRp(data.totalKeluarTahunan) : "..."}
            </h3>
          </div>
          <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-800">
            <span>Jariyah: {data ? formatRp(data.totalKeluarJariyahTahunan) : "..."}</span>
            <span>Infaq: {data ? formatRp(data.totalKeluarInfaqTahunan) : "..."}</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Gambar Grafik Batang (12 Bulan) */}
      <div className="relative pt-2">
        {/* Indikator Mode & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
          <div className="text-slate-500 text-xs">
            Arahkan kursor atau sentuh batang bulan untuk melihat rincian detail nominal:
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {kasMode === "SEMUA" && (
              <>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-xs" />
                  <span>Total Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-xs" />
                  <span>Total Pengeluaran</span>
                </div>
              </>
            )}

            {kasMode === "JARIYAH" && (
              <>
                <div className="flex items-center gap-1.5 font-medium text-teal-700">
                  <span className="w-3 h-3 rounded-md bg-teal-500 inline-block shadow-xs" />
                  <span>Pemasukan Jariyah</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-rose-700">
                  <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-xs" />
                  <span>Pengeluaran Jariyah</span>
                </div>
              </>
            )}

            {kasMode === "INFAQ" && (
              <>
                <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-xs" />
                  <span>Pemasukan Infaq</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-rose-700">
                  <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-xs" />
                  <span>Pengeluaran Infaq</span>
                </div>
              </>
            )}

            {kasMode === "KOMPARASI" && (
              <>
                <div className="flex items-center gap-1 font-medium text-teal-700 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                  <span>Masuk Jariyah</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-cyan-700 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600 inline-block" />
                  <span>Keluar Jariyah</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-emerald-700 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  <span>Masuk Infaq</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-rose-700 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  <span>Keluar Infaq</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-200/80">
          <div className="relative h-64 sm:h-72 w-full flex flex-col justify-end">
            {/* Gridlines & Sumbu Y */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {yTicks.map((tickVal, idx) => (
                <div key={idx} className="flex items-center gap-2 w-full">
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 w-14 sm:w-16 text-right shrink-0">
                    {formatShortRp(tickVal)}
                  </span>
                  <div className="w-full border-b border-slate-200/70" />
                </div>
              ))}
            </div>

            {/* 12 Batang Bulan */}
            <div className="relative pl-14 sm:pl-16 pr-2 h-full flex items-end justify-between gap-1 sm:gap-2 pb-8 pt-4">
              {monthlyList.map((m) => {
                const isCurrent =
                  selectedYear === currentYear && m.bulanIndex === currentMonthIdx;
                const isHovered = hoveredMonth === m.bulanIndex;

                // Tentukan nilai per batang berdasarkan mode kas
                let bar1Val = 0; // Pemasukan 1 / Jariyah Masuk
                let bar2Val = 0; // Pengeluaran 1 / Jariyah Keluar
                let bar3Val = 0; // Infaq Masuk (komparasi)
                let bar4Val = 0; // Infaq Keluar (komparasi)

                if (kasMode === "SEMUA") {
                  bar1Val = m.totalMasuk;
                  bar2Val = m.totalKeluar;
                } else if (kasMode === "JARIYAH") {
                  bar1Val = m.masukJariyah;
                  bar2Val = m.keluarJariyah;
                } else if (kasMode === "INFAQ") {
                  bar1Val = m.masukInfaq;
                  bar2Val = m.keluarInfaq;
                } else {
                  // KOMPARASI
                  bar1Val = m.masukJariyah;
                  bar2Val = m.keluarJariyah;
                  bar3Val = m.masukInfaq;
                  bar4Val = m.keluarInfaq;
                }

                const h1Percent = Math.min(100, Math.round((bar1Val / maxVal) * 100));
                const h2Percent = Math.min(100, Math.round((bar2Val / maxVal) * 100));
                const h3Percent = Math.min(100, Math.round((bar3Val / maxVal) * 100));
                const h4Percent = Math.min(100, Math.round((bar4Val / maxVal) * 100));

                return (
                  <div
                    key={m.bulanIndex}
                    onMouseEnter={() => setHoveredMonth(m.bulanIndex)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    onClick={() => setHoveredMonth(m.bulanIndex)}
                    className={`flex-1 h-full flex flex-col justify-end items-center cursor-pointer group transition-all relative rounded-xl px-0.5 sm:px-1 ${
                      isHovered ? "bg-emerald-500/10" : "hover:bg-slate-200/50"
                    }`}
                  >
                    {/* Batang-batang grafik */}
                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-0.5">
                      {kasMode !== "KOMPARASI" ? (
                        <>
                          {/* Batang Pemasukan */}
                          <div
                            style={{ height: `${Math.max(bar1Val > 0 ? 4 : 0, h1Percent)}%` }}
                            className={`w-1/2 max-w-[18px] rounded-t-md transition-all duration-300 ${
                              kasMode === "JARIYAH"
                                ? "bg-gradient-to-t from-teal-600 to-teal-400 group-hover:from-teal-500 group-hover:to-teal-300"
                                : "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
                            } ${isHovered ? "shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400" : ""}`}
                            title={`Pemasukan: ${formatRp(bar1Val)}`}
                          />

                          {/* Batang Pengeluaran */}
                          <div
                            style={{ height: `${Math.max(bar2Val > 0 ? 4 : 0, h2Percent)}%` }}
                            className={`w-1/2 max-w-[18px] rounded-t-md bg-gradient-to-t from-rose-600 to-rose-400 group-hover:from-rose-500 group-hover:to-rose-300 transition-all duration-300 ${
                              isHovered ? "shadow-md shadow-rose-600/30 ring-2 ring-rose-400" : ""
                            }`}
                            title={`Pengeluaran: ${formatRp(bar2Val)}`}
                          />
                        </>
                      ) : (
                        <>
                          {/* Komparasi 4 Batang: Jariyah In, Jariyah Out, Infaq In, Infaq Out */}
                          <div
                            style={{ height: `${Math.max(bar1Val > 0 ? 3 : 0, h1Percent)}%` }}
                            className="w-1/4 max-w-[8px] rounded-t-xs bg-teal-500"
                            title={`Masuk Jariyah: ${formatRp(bar1Val)}`}
                          />
                          <div
                            style={{ height: `${Math.max(bar2Val > 0 ? 3 : 0, h2Percent)}%` }}
                            className="w-1/4 max-w-[8px] rounded-t-xs bg-cyan-700"
                            title={`Keluar Jariyah: ${formatRp(bar2Val)}`}
                          />
                          <div
                            style={{ height: `${Math.max(bar3Val > 0 ? 3 : 0, h3Percent)}%` }}
                            className="w-1/4 max-w-[8px] rounded-t-xs bg-emerald-500"
                            title={`Masuk Infaq: ${formatRp(bar3Val)}`}
                          />
                          <div
                            style={{ height: `${Math.max(bar4Val > 0 ? 3 : 0, h4Percent)}%` }}
                            className="w-1/4 max-w-[8px] rounded-t-xs bg-rose-500"
                            title={`Keluar Infaq: ${formatRp(bar4Val)}`}
                          />
                        </>
                      )}
                    </div>

                    {/* Label Bulan pada Sumbu X */}
                    <div className="absolute -bottom-6 flex flex-col items-center">
                      <span
                        className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition ${
                          isCurrent
                            ? "text-emerald-700 font-bold underline decoration-2 decoration-emerald-500 underline-offset-2"
                            : isHovered
                            ? "text-slate-900 font-bold"
                            : "text-slate-500"
                        }`}
                      >
                        {m.singkat}
                      </span>
                      {isCurrent && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Popover Detail Bulan Terpilih / Aktif */}
        {activeMonthData && (
          <div className="mt-6 bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm transition-all duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900">
                  Rincian Kas Bulan {activeMonthData.namaBulan} {selectedYear}
                </h4>
                {selectedYear === currentYear && activeMonthData.bulanIndex === currentMonthIdx && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Bulan Berjalan
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Surplus Bersih Bulan Ini:{" "}
                <span
                  className={`font-bold ${
                    activeMonthData.surplus >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatRp(activeMonthData.surplus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Kas Jariyah */}
              <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/50">
                <div className="flex items-center gap-1.5 text-teal-800 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <Landmark className="w-3.5 h-3.5 text-teal-600" />
                  <span>Kas Jariyah</span>
                </div>
                <div className="flex justify-between text-slate-600 mt-1">
                  <span>Masuk:</span>
                  <span className="font-bold text-emerald-600">
                    +{formatRp(activeMonthData.masukJariyah)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 mt-0.5">
                  <span>Keluar:</span>
                  <span className="font-bold text-rose-500">
                    -{formatRp(activeMonthData.keluarJariyah)}
                  </span>
                </div>
              </div>

              {/* Kas Infaq */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kas Infaq / Shodaqoh</span>
                </div>
                <div className="flex justify-between text-slate-600 mt-1">
                  <span>Masuk:</span>
                  <span className="font-bold text-emerald-600">
                    +{formatRp(activeMonthData.masukInfaq)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 mt-0.5">
                  <span>Keluar:</span>
                  <span className="font-bold text-rose-500">
                    -{formatRp(activeMonthData.keluarInfaq)}
                  </span>
                </div>
              </div>

              {/* Total Pemasukan Bulan Ini */}
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/50 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Total Masuk Bulan Ini
                </span>
                <span className="text-base font-extrabold text-emerald-700 mt-1">
                  +{formatRp(activeMonthData.totalMasuk)}
                </span>
                <span className="text-[10px] text-emerald-600/80">
                  Gabungan Jariyah & Infaq
                </span>
              </div>

              {/* Total Pengeluaran Bulan Ini */}
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/50 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  Total Keluar Bulan Ini
                </span>
                <span className="text-base font-extrabold text-rose-700 mt-1">
                  -{formatRp(activeMonthData.totalKeluar)}
                </span>
                <span className="text-[10px] text-rose-600/80">
                  Gabungan Jariyah & Infaq
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
