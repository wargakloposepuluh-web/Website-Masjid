"use client";

import React, { useState, useRef } from "react";
import {
  Printer,
  X,
  CheckSquare,
  Square,
  FileText,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  Landmark,
  HeartHandshake,
  StretchHorizontal,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";

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
}

interface SettingData {
  namaOrganisasi?: string;
  alamatOrganisasi?: string;
  kontakOrganisasi?: string;
  kopType?: string;
  kopImageUrl?: string;
  logoKiriUrl?: string;
  kotaSurat?: string;
  penandatanganNama?: string;
  penandatanganJabatan?: string;
  ttdImageUrl?: string;
  stempelImageUrl?: string;
  stempelUkuran?: number;
  stempelOpacity?: number;
}

interface ModalCetakLaporanKasProps {
  isOpen: boolean;
  onClose: () => void;
  items: TransaksiItem[];
  stats: StatsData | null;
  setting: SettingData | null;
  filterKategori: string;
  filterJenis: string;
  startDate?: string;
  endDate?: string;
}

export default function ModalCetakLaporanKas({
  isOpen,
  onClose,
  items,
  stats,
  setting,
  filterKategori,
  filterJenis,
  startDate,
  endDate,
}: ModalCetakLaporanKasProps) {
  const [tampilkanKop, setTampilkanKop] = useState(true);
  const [tampilkanRingkasan, setTampilkanRingkasan] = useState(true);
  const [tampilkanTtd, setTampilkanTtd] = useState(true);
  const [tampilkanStempel, setTampilkanStempel] = useState(true);
  const [orientasi, setOrientasi] = useState<"portrait" | "landscape">("portrait");
  const [zoom, setZoom] = useState(0.85);

  if (!isOpen) return null;

  const formatRp = (num: number) => {
    return "Rp " + (num || 0).toLocaleString("id-ID");
  };

  // Urutkan transaksi dari tanggal terlama ke terbaru untuk pembukuan kas yang kronologis
  const sortedItems = [...items].sort((a, b) => {
    return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
  });

  // Hitung total masuk, total keluar, dan saldo berjalan dalam periode yang dicetak
  let runningSaldo = 0;
  let totalMasukPeriode = 0;
  let totalKeluarPeriode = 0;

  const calculatedItems = sortedItems.map((item) => {
    const isMasuk = item.jenis === "MASUK";
    const nom = Number(item.nominal) || 0;
    if (isMasuk) {
      totalMasukPeriode += nom;
      runningSaldo += nom;
    } else {
      totalKeluarPeriode += nom;
      runningSaldo -= nom;
    }
    return {
      ...item,
      saldoBerjalan: runningSaldo,
    };
  });

  const handlePrintNow = () => {
    window.print();
  };

  // Label periode
  let labelPeriode = "Semua Catatan Transaksi";
  if (startDate && endDate) {
    labelPeriode = `${formatIndoDate(startDate)} s/d ${formatIndoDate(endDate)}`;
  } else if (startDate) {
    labelPeriode = `Mulai ${formatIndoDate(startDate)}`;
  } else if (endDate) {
    labelPeriode = `Sampai ${formatIndoDate(endDate)}`;
  }

  // Label kategori
  let labelKategori = "Semua Kas (Kas Jariyah & Kas Infaq)";
  if (filterKategori === "JARIYAH") labelKategori = "Khusus Kas Jariyah (Pembangunan & Aset)";
  if (filterKategori === "INFAQ") labelKategori = "Khusus Kas Infaq / Shodaqoh (Operasional)";

  // Image assets
  const kopBannerUrl = setting?.kopImageUrl || "/kop-masjid.png";
  const ttdKetuaUrl = setting?.ttdImageUrl || "/uploads/1788993992647_TTD_H_Wawan.png";
  const stempelUrl = setting?.stempelImageUrl || "/uploads/1788993958297_Stample_transparat.png";
  const namaKetua = setting?.penandatanganNama || "H. Sullamul Hadi Nurmawan, S.Th.I";
  const namaBendahara = "H. M. Sutris";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto">
      {/* 1. Toolbar Kontrol Atas (Hanya tampil di layar, tersembunyi saat dicetak) */}
      <div className="no-print sticky top-0 z-50 w-full bg-slate-900/95 text-white border-b border-slate-700/80 px-4 sm:px-6 py-3 shadow-xl backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Pratinjau Cetak Laporan Kas Masjid
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-emerald-100 font-extrabold uppercase tracking-wider">
                  F4 / Folio • {orientasi === "landscape" ? "Lanskap" : "Potret"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {orientasi === "landscape"
                  ? "Standar Folio F4 Lanskap (330 mm × 215 mm) - Tabel lebih lebar & mendatar"
                  : "Standar Folio F4 Potret (215 mm × 330 mm) - Format tegak resmi"}
              </p>
            </div>
          </div>

          {/* Opsi & Checklist */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Pilihan Orientasi: Potret vs Lanskap */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setOrientasi("portrait");
                  setZoom(0.85);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  orientasi === "portrait"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Format Tegak / Portrait (215 mm × 330 mm)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Potret</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrientasi("landscape");
                  setZoom(0.7);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  orientasi === "landscape"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Format Mendatar / Landscape (330 mm × 215 mm)"
              >
                <StretchHorizontal className="w-3.5 h-3.5" />
                <span>Lanskap</span>
              </button>
            </div>

            {/* Toggle Kop */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={tampilkanKop}
                onChange={(e) => setTampilkanKop(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Kop</span>
            </label>

            {/* Toggle Ringkasan */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={tampilkanRingkasan}
                onChange={(e) => setTampilkanRingkasan(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Ringkasan</span>
            </label>

            {/* Toggle TTD */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={tampilkanTtd}
                onChange={(e) => setTampilkanTtd(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>TTD</span>
            </label>

            {/* Toggle Stempel */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={tampilkanStempel}
                onChange={(e) => setTampilkanStempel(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Stempel</span>
            </label>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.1).toFixed(2))))}
                className="p-1 hover:text-emerald-400 text-slate-300 transition"
                title="Zoom Out (hingga 30%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <select
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                className="text-[11px] font-mono text-slate-200 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-700 hover:border-slate-500 focus:outline-none cursor-pointer"
                title="Pilih Skala Zoom"
              >
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
                <option value={60}>60%</option>
                <option value={70}>70%</option>
                <option value={85}>85% (Normal)</option>
                <option value={100}>100%</option>
                <option value={120}>120%</option>
                {![30, 40, 50, 60, 70, 85, 100, 120].includes(Math.round(zoom * 100)) && (
                  <option value={Math.round(zoom * 100)}>{Math.round(zoom * 100)}%</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                className="p-1 hover:text-emerald-400 text-slate-300 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tombol Cetak Sekarang */}
            <button
              type="button"
              onClick={handlePrintNow}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/30 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak ({orientasi === "landscape" ? "Lanskap" : "Potret"})</span>
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic @page Style Injection */}
      {orientasi === "landscape" ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: 330mm 215mm landscape !important;
                  margin: 0 !important;
                }
              }
            `,
          }}
        />
      ) : (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: 215mm 330mm portrait !important;
                  margin: 0 !important;
                }
              }
            `,
          }}
        />
      )}

      {/* 2. Container Lembar Kertas F4 (Tampil di Layar dengan Skala Zoom & Muncul Utuh saat Print) */}
      <div className="w-full flex justify-center py-6 sm:py-8 overflow-x-auto">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="print-transform-none"
        >
          {/* LEMBAR KERTAS RESMI F4 (Potret: 215x330mm | Lanskap: 330x215mm) */}
          <div
            className={`print-laporan ${orientasi === "landscape" ? "is-landscape" : ""} bg-white text-black shadow-2xl relative box-border`}
            style={{
              width: orientasi === "landscape" ? "330mm" : "215mm",
              minHeight: orientasi === "landscape" ? "215mm" : "330mm",
              padding: orientasi === "landscape" ? "12mm 18mm 15mm 18mm" : "15mm 18mm 20mm 18mm",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: orientasi === "landscape" ? "9.5pt" : "10pt",
              lineHeight: 1.35,
            }}
          >
            {/* A. KOP SURAT MASJID */}
            {tampilkanKop && (
              <div className="mb-4 pb-2 border-b-2 border-black">
                {setting?.kopType === "text" ? (
                  <div className="flex items-center justify-between gap-4 pb-2">
                    {/* Logo Kiri */}
                    <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={setting.logoKiriUrl || "/logo-masjid-baitul-maghfirah.png"}
                        alt="Logo Masjid"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Teks Identitas */}
                    <div className="text-center flex-1">
                      <h1 className="text-lg font-extrabold uppercase tracking-wide text-black">
                        {setting.namaOrganisasi || "PENGURUS MASJID BAITUL MAGHFIRAH"}
                      </h1>
                      <p className="text-xs text-black mt-0.5 font-medium">
                        {setting.alamatOrganisasi ||
                          "Jl. Raya Kloposepuluh, RT : 11, RW : 03, - Sukodono - Sidoarjo"}
                      </p>
                      {setting.kontakOrganisasi && (
                        <p className="text-[9pt] text-neutral-700 mt-0.5">
                          {setting.kontakOrganisasi}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kopBannerUrl}
                      alt="Kop Surat Resmi Masjid"
                      className="w-full max-h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* B. JUDUL & INFORMASI LAPORAN */}
            <div className="text-center mb-5">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-black underline underline-offset-4">
                BUKU LAPORAN KEUANGAN KAS MASJID
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-black mt-1">
                MASJID BAITUL MAGHFIRAH KLOPOSEPULUH
              </p>
              <div className="flex flex-wrap items-center justify-between text-[9pt] text-black mt-3 pt-1 border-t border-black/30">
                <span className="font-semibold">Kategori: {labelKategori}</span>
                <span className="font-semibold">Periode: {labelPeriode}</span>
                <span className="font-semibold">
                  Dicetak: {formatIndoDate(new Date())}
                </span>
              </div>
            </div>

            {/* C. RINGKASAN SALDO KAS (BOX SUMMARY) */}
            {tampilkanRingkasan && (
              <div className="mb-5 border border-black p-3 bg-neutral-50/50 rounded-sm">
                <div className="text-[9pt] font-extrabold uppercase tracking-wider mb-2 border-b border-black pb-1 flex justify-between">
                  <span>Ringkasan Saldo & Posisi Kas Masjid</span>
                  <span className="font-normal lowercase text-[8.5pt]">
                    (posisi per {formatIndoDate(new Date())})
                  </span>
                </div>
                {orientasi === "landscape" ? (
                  <div className="grid grid-cols-6 gap-2 text-[8.5pt]">
                    <div className="border-r border-neutral-300 pr-2">
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Saldo Kas Jariyah:
                      </span>
                      <span className="block text-xs font-bold text-black mt-0.5">
                        {stats ? formatRp(stats.saldoJariyah) : "Rp 0"}
                      </span>
                    </div>
                    <div className="border-r border-neutral-300 pr-2">
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Saldo Kas Infaq:
                      </span>
                      <span className="block text-xs font-bold text-black mt-0.5">
                        {stats ? formatRp(stats.saldoInfaq) : "Rp 0"}
                      </span>
                    </div>
                    <div className="border-r border-neutral-300 pr-2">
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Total Saldo Kas:
                      </span>
                      <span className="block text-xs font-extrabold text-black mt-0.5">
                        {stats ? formatRp(stats.totalSaldo) : "Rp 0"}
                      </span>
                    </div>
                    <div className="border-r border-neutral-300 pr-2">
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Pemasukan Periode Ini:
                      </span>
                      <span className="block text-xs font-bold text-emerald-800 mt-0.5">
                        +{formatRp(totalMasukPeriode)}
                      </span>
                    </div>
                    <div className="border-r border-neutral-300 pr-2">
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Pengeluaran Periode Ini:
                      </span>
                      <span className="block text-xs font-bold text-rose-800 mt-0.5">
                        -{formatRp(totalKeluarPeriode)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[7.5pt] text-neutral-600 font-medium">
                        Surplus Kas Periode:
                      </span>
                      <span className="block text-xs font-extrabold text-black mt-0.5">
                        {formatRp(totalMasukPeriode - totalKeluarPeriode)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-[9pt]">
                      {/* Saldo Jariyah */}
                      <div className="border-r border-neutral-300 pr-2">
                        <span className="block text-[8.5pt] text-neutral-600 font-medium">
                          Saldo Kas Jariyah (Pembangunan):
                        </span>
                        <span className="block text-xs font-bold text-black mt-0.5">
                          {stats ? formatRp(stats.saldoJariyah) : "Rp 0"}
                        </span>
                      </div>

                      {/* Saldo Infaq */}
                      <div className="border-r border-neutral-300 pr-2">
                        <span className="block text-[8.5pt] text-neutral-600 font-medium">
                          Saldo Kas Infaq (Operasional):
                        </span>
                        <span className="block text-xs font-bold text-black mt-0.5">
                          {stats ? formatRp(stats.saldoInfaq) : "Rp 0"}
                        </span>
                      </div>

                      {/* Total Saldo Keseluruhan */}
                      <div>
                        <span className="block text-[8.5pt] text-neutral-600 font-medium">
                          Total Saldo Keseluruhan:
                        </span>
                        <span className="block text-xs font-extrabold text-black mt-0.5">
                          {stats ? formatRp(stats.totalSaldo) : "Rp 0"}
                        </span>
                      </div>
                    </div>

                    {/* Sub-baris mutasi dalam laporan */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-200 flex justify-between items-center text-[8.5pt] text-neutral-800">
                      <span>
                        Pemasukan Periode Ini:{" "}
                        <strong className="text-black font-bold">
                          +{formatRp(totalMasukPeriode)}
                        </strong>
                      </span>
                      <span>
                        Pengeluaran Periode Ini:{" "}
                        <strong className="text-black font-bold">
                          -{formatRp(totalKeluarPeriode)}
                        </strong>
                      </span>
                      <span>
                        Selisih Bersih (Surplus):{" "}
                        <strong className="text-black font-bold">
                          {formatRp(totalMasukPeriode - totalKeluarPeriode)}
                        </strong>
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* D. TABEL BUKU KAS (LEDGER TRANSAKSI) */}
            <div className="mb-6">
              <table className="w-full text-left border-collapse text-[8.5pt]">
                <thead>
                  <tr className="bg-neutral-100 border-t-2 border-b-2 border-black text-black font-extrabold uppercase text-[8pt]">
                    <th className="py-2 px-2 border-r border-black/40 text-center w-8">
                      No
                    </th>
                    <th className="py-2 px-2 border-r border-black/40 text-center w-24">
                      Tanggal
                    </th>
                    <th className="py-2 px-2 border-r border-black/40 text-center w-24">
                      Kas
                    </th>
                    <th className="py-2 px-2 border-r border-black/40">
                      Uraian / Keterangan Transaksi
                    </th>
                    <th className="py-2 px-2 border-r border-black/40 text-right w-28">
                      Penerimaan (Rp)
                    </th>
                    <th className="py-2 px-2 border-r border-black/40 text-right w-28">
                      Pengeluaran (Rp)
                    </th>
                    <th className="py-2 px-2 text-right w-28">
                      Saldo Berjalan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  {calculatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-neutral-500 italic">
                        Tidak ada catatan transaksi pada filter atau periode ini.
                      </td>
                    </tr>
                  ) : (
                    calculatedItems.map((item, idx) => {
                      const isMasuk = item.jenis === "MASUK";
                      return (
                        <tr key={item.id} className="border-b border-black/20 hover:bg-neutral-50">
                          <td className="py-1.5 px-2 text-center font-mono border-r border-black/30">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-black/30 whitespace-nowrap">
                            {formatIndoDate(item.tanggal)}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-black/30 font-semibold whitespace-nowrap">
                            {item.kategoriKas === "JARIYAH" ? "Jariyah" : "Infaq"}
                          </td>
                          <td className="py-1.5 px-2 border-r border-black/30">
                            <div className="font-semibold text-black leading-tight">
                              {item.keterangan}
                            </div>
                            {item.dicatatOleh && (
                              <div className="text-[7.5pt] text-neutral-500 mt-0.5">
                                Dicatat oleh: {item.dicatatOleh}
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-black/30 font-semibold whitespace-nowrap">
                            {isMasuk ? formatRp(item.nominal) : "-"}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-black/30 font-semibold whitespace-nowrap">
                            {!isMasuk ? formatRp(item.nominal) : "-"}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold whitespace-nowrap">
                            {formatRp(item.saldoBerjalan)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* FOOTER TOTAL */}
                <tfoot>
                  <tr className="bg-neutral-100 border-t-2 border-b-2 border-black font-extrabold text-[8.5pt]">
                    <td colSpan={4} className="py-2 px-3 text-right uppercase border-r border-black/40">
                      TOTAL TRANSAKSI PERIODE INI:
                    </td>
                    <td className="py-2 px-2 text-right font-mono border-r border-black/40 text-black">
                      +{formatRp(totalMasukPeriode)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono border-r border-black/40 text-black">
                      -{formatRp(totalKeluarPeriode)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-black">
                      {formatRp(runningSaldo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* E. LEMBAR PENGESAHAN (TANDA TANGAN KETUA, BENDAHARA, DAN CAP STEMPEL) */}
            {tampilkanTtd && (
              <div className="mt-8 pt-4 border-t border-black/40 text-xs">
                <div className="grid grid-cols-2 gap-8 text-center">
                  {/* Kolom Kiri: Mengetahui Ketua Umum DKM + TTD + STEMPEL */}
                  <div className="flex flex-col items-center justify-between min-h-[160px]">
                    <div>
                      <p className="font-normal text-black">Mengetahui,</p>
                      <p className="font-bold text-black uppercase tracking-wide">
                        Ketua Umum DKM Masjid
                      </p>
                    </div>

                    {/* Area TTD & Stempel Overlay */}
                    <div className="relative w-48 h-24 my-1 flex items-center justify-center">
                      {/* Gambar Tanda Tangan Digital Ketua */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ttdKetuaUrl}
                        alt="Tanda Tangan Ketua"
                        className="h-20 max-w-[170px] object-contain relative z-10"
                      />

                      {/* Cap Stempel Resmi Masjid (Menimpa TTD secara proporsional) */}
                      {tampilkanStempel && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stempelUrl}
                          alt="Cap Stempel Resmi Masjid"
                          className="absolute -left-2 -top-1 w-28 h-28 object-contain pointer-events-none mix-blend-multiply opacity-90 z-20"
                        />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-black underline underline-offset-2">
                        {namaKetua}
                      </p>
                      <p className="text-[8pt] text-neutral-600">Ketua DKM</p>
                    </div>
                  </div>

                  {/* Kolom Kanan: Bendahara Umum */}
                  <div className="flex flex-col items-center justify-between min-h-[160px]">
                    <div>
                      <p className="font-normal text-black">
                        {setting?.kotaSurat || "Kloposepuluh"},{" "}
                        {formatIndoDate(new Date())}
                      </p>
                      <p className="font-bold text-black uppercase tracking-wide">
                        Bendahara Umum Masjid
                      </p>
                    </div>

                    {/* Ruang TTD Bendahara */}
                    <div className="w-48 h-24 my-1 flex items-center justify-center">
                      <div className="w-32 border-b border-dashed border-neutral-300 h-16" />
                    </div>

                    <div>
                      <p className="font-bold text-black underline underline-offset-2">
                        {namaBendahara}
                      </p>
                      <p className="text-[8pt] text-neutral-600">Bendahara DKM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
