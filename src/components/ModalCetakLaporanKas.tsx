"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  FileDown,
  Loader2,
  Sliders,
} from "lucide-react";
import { formatIndoDate, formatNumericDate } from "@/lib/utils";

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
  // Pengaturan Cetak Laporan Keuangan
  laporanMarginTop?: number;
  laporanMarginBottom?: number;
  laporanMarginLeft?: number;
  laporanMarginRight?: number;
  laporanKopType?: string;
  laporanKopImageUrl?: string;
  laporanJudul?: string;
  laporanSubJudul?: string;
  laporanDaftarPenandatangan?: string;
  laporanTampilkanKop?: boolean;
  laporanTampilkanRingkasan?: boolean;
  laporanTampilkanTtd?: boolean;
  laporanTampilkanStempel?: boolean;
  laporanUkuranKertas?: string;
  laporanFontSize?: number;
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

interface CalculatedItem extends TransaksiItem {
  saldoBerjalan: number;
}

interface PageItem extends CalculatedItem {
  globalIndex: number;
}

interface LaporanPage {
  pageNumber: number;
  totalPages: number;
  items: PageItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  showSignatures: boolean;
  isSignatureOnlyPage?: boolean;
}

/**
 * Algoritma partisi fisik per lembar kertas F4 Lanskap (330mm x 215mm).
 * Memaksimalkan baris data di setiap lembar fisik. Jika seluruh baris transaksi
 * muat dalam satu lembar tetapi tanggal & tanda tangan tertutup/tidak muat,
 * maka baris transaksi tetap berada di lembar tersebut dan HANYA tanggal serta
 * tanda tangan yang berpindah ke lembar/halaman pengesahan berikutnya.
 */
function partitionLaporanPages(
  items: CalculatedItem[],
  tampilkanKop: boolean,
  tampilkanRingkasan: boolean,
  tampilkanTtd: boolean
): LaporanPage[] {
  const indexedItems: PageItem[] = items.map((it, idx) => ({
    ...it,
    globalIndex: idx,
  }));

  const total = indexedItems.length;

  // Kapasitas baris Lembar 1 jika memuat Kop, Ringkasan, Tabel, Footer Total, DAN TTD:
  // (TTD butuh tinggi ~145-160px). Maksimal 6 baris agar TTD tidak tertutup.
  let singleWithTtdMax = 6;
  if (!tampilkanKop) singleWithTtdMax += 5;
  if (!tampilkanRingkasan) singleWithTtdMax += 3;
  if (!tampilkanTtd) singleWithTtdMax += 8;

  // Kapasitas baris Lembar 1 TANPA TTD (hanya Kop, Ringkasan, Tabel, dan Total/Bersambung):
  let p1MaxRows = 14;
  if (!tampilkanKop) p1MaxRows += 5;
  if (!tampilkanRingkasan) p1MaxRows += 3;

  // Kasus 1: Seluruh data transaksi muat di lembar 1 BERSAMA TTD
  if (total <= singleWithTtdMax || !tampilkanTtd) {
    if (total <= (tampilkanTtd ? singleWithTtdMax : p1MaxRows)) {
      return [
        {
          pageNumber: 1,
          totalPages: 1,
          items: indexedItems,
          isFirstPage: true,
          isLastPage: true,
          showSignatures: tampilkanTtd,
          isSignatureOnlyPage: false,
        },
      ];
    }
  }

  // Kasus 2: Seluruh baris transaksi CUKUP di satu lembar (total <= p1MaxRows),
  // tetapi tanggal & tanda tangan TIDAK CUKUP/TERTUTUP (total > singleWithTtdMax).
  // Sesuai permintaan: Baris tetap di lembar tersebut (Lembar 1),
  // yang berpindah HANYA tanggal dan tanda tangan ke lembar berikutnya!
  if (total <= p1MaxRows && tampilkanTtd) {
    return [
      {
        pageNumber: 1,
        totalPages: 2,
        items: indexedItems,
        isFirstPage: true,
        isLastPage: false,
        showSignatures: false,
        isSignatureOnlyPage: false,
      },
      {
        pageNumber: 2,
        totalPages: 2,
        items: [],
        isFirstPage: false,
        isLastPage: true,
        showSignatures: true,
        isSignatureOnlyPage: true,
      },
    ];
  }

  // Kasus 3: Data transaksi sangat banyak (> p1MaxRows), sehingga tabel memang harus
  // memecah baris data ke beberapa lembar lanjutan.
  const interMax = 20;
  const finalWithTtdMax = 9;

  let pagesChunk: PageItem[][] = [];

  // Isi Lembar 1 hingga penuh (p1MaxRows)
  let p1Take = Math.min(p1MaxRows, total);
  pagesChunk.push(indexedItems.slice(0, p1Take));
  let cursor = p1Take;
  let rem = total - cursor;

  while (rem > 0) {
    // Jika sisa baris muat di lembar terakhir bersama TTD
    if (rem <= finalWithTtdMax) {
      pagesChunk.push(indexedItems.slice(cursor));
      cursor += rem;
      rem = 0;
      break;
    }
    // Jika sisa baris muat penuh dalam lembar tabel (<= interMax) tetapi tidak muat jika ditambah TTD
    if (rem <= interMax) {
      // Seluruh sisa baris muat di lembar ini, TTD pindah ke lembar khusus pengesahan
      pagesChunk.push(indexedItems.slice(cursor));
      cursor += rem;
      rem = 0;
      break;
    }
    // Masih ada banyak baris
    let take = interMax;
    pagesChunk.push(indexedItems.slice(cursor, cursor + take));
    cursor += take;
    rem -= take;
  }

  // Periksa apakah lembar terakhir potongan tabel memuat baris data yang melebihi finalWithTtdMax:
  // Jika ya, TTD dipindah ke lembar pengesahan khusus di halaman berikutnya.
  const lastChunk = pagesChunk[pagesChunk.length - 1];
  const needExtraSignaturePage = tampilkanTtd && lastChunk.length > finalWithTtdMax;

  const totalPages = pagesChunk.length + (needExtraSignaturePage ? 1 : 0);

  const result: LaporanPage[] = pagesChunk.map((chunk, idx) => {
    const isFirstPage = idx === 0;
    const isLastPage = idx === pagesChunk.length - 1 && !needExtraSignaturePage;
    return {
      pageNumber: idx + 1,
      totalPages,
      items: chunk,
      isFirstPage,
      isLastPage,
      showSignatures: isLastPage && tampilkanTtd,
      isSignatureOnlyPage: false,
    };
  });

  if (needExtraSignaturePage) {
    result.push({
      pageNumber: totalPages,
      totalPages,
      items: [],
      isFirstPage: false,
      isLastPage: true,
      showSignatures: true,
      isSignatureOnlyPage: true,
    });
  }

  return result;
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
  const [zoom, setZoom] = useState(0.7);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inisialisasi status checklist sesuai pengaturan bawaan yang disimpan
  useEffect(() => {
    if (setting) {
      if (setting.laporanTampilkanKop !== undefined) setTampilkanKop(Boolean(setting.laporanTampilkanKop));
      if (setting.laporanTampilkanRingkasan !== undefined) setTampilkanRingkasan(Boolean(setting.laporanTampilkanRingkasan));
      if (setting.laporanTampilkanTtd !== undefined) setTampilkanTtd(Boolean(setting.laporanTampilkanTtd));
      if (setting.laporanTampilkanStempel !== undefined) setTampilkanStempel(Boolean(setting.laporanTampilkanStempel));
    }
  }, [setting, isOpen]);

  // Konfigurasi Kertas, Margin & Font dari Pengaturan Cetak
  const isA4 = setting?.laporanUkuranKertas === "A4";
  const paperWidthMm = isA4 ? 297 : 330;
  const paperHeightMm = isA4 ? 210 : 215;
  const paperWidthStr = `${paperWidthMm}mm`;
  const paperHeightStr = `${paperHeightMm}mm`;

  const marginTop = setting?.laporanMarginTop !== undefined && setting?.laporanMarginTop !== null ? `${setting.laporanMarginTop}cm` : "10mm";
  const marginBottom = setting?.laporanMarginBottom !== undefined && setting?.laporanMarginBottom !== null ? `${setting.laporanMarginBottom}cm` : "10mm";
  const marginLeft = setting?.laporanMarginLeft !== undefined && setting?.laporanMarginLeft !== null ? `${setting.laporanMarginLeft}cm` : "12mm";
  const marginRight = setting?.laporanMarginRight !== undefined && setting?.laporanMarginRight !== null ? `${setting.laporanMarginRight}cm` : "12mm";
  const paddingStyle = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;

  const fontSizeStr = setting?.laporanFontSize ? `${setting.laporanFontSize}pt` : "12pt";

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

  const calculatedItems: CalculatedItem[] = sortedItems.map((item) => {
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

  // Partisi transaksi ke lembar-lembar fisik F4 lanskap
  const pages = partitionLaporanPages(
    calculatedItems,
    tampilkanKop,
    tampilkanRingkasan,
    tampilkanTtd
  );

  const getSafeFileName = () => {
    let namaFile = "Laporan_Kas_Masjid";
    if (filterKategori === "JARIYAH") namaFile += "_Jariyah";
    else if (filterKategori === "INFAQ") namaFile += "_Infaq";
    else namaFile += "_Semua_Kas";

    if (startDate && endDate) {
      namaFile += `_${startDate}_sd_${endDate}`;
    } else {
      const today = new Date().toISOString().split("T")[0];
      namaFile += `_${today}`;
    }
    return `${namaFile}.pdf`;
  };

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    setIsExportingPdf(true);

    const fileName = getSafeFileName();

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const sheetElements = containerRef.current.querySelectorAll<HTMLElement>(".print-laporan-sheet");
      if (!sheetElements || sheetElements.length === 0) return;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: isA4 ? [210, 297] : [215, 330],
        compress: true,
      });

      for (let i = 0; i < sheetElements.length; i++) {
        const sourceEl = sheetElements[i];

        // Clone target element lembar fisik
        const clone = sourceEl.cloneNode(true) as HTMLElement;
        clone.style.transform = "none";
        clone.style.boxShadow = "none";
        clone.style.margin = "0";
        clone.style.width = paperWidthStr;
        clone.style.height = paperHeightStr;
        clone.style.minHeight = paperHeightStr;
        clone.style.maxHeight = paperHeightStr;
        clone.style.padding = paddingStyle;
        clone.style.fontSize = fontSizeStr;
        clone.style.boxSizing = "border-box";
        clone.style.backgroundColor = "#ffffff";

        const tempContainer = document.createElement("div");
        tempContainer.style.position = "fixed";
        tempContainer.style.top = "0";
        tempContainer.style.left = "0";
        tempContainer.style.width = paperWidthStr;
        tempContainer.style.height = paperHeightStr;
        tempContainer.style.zIndex = "-99999";
        tempContainer.style.pointerEvents = "none";
        tempContainer.style.backgroundColor = "#ffffff";
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        // Tunggu seluruh gambar selesai dimuat
        const imgs = Array.from(clone.querySelectorAll("img"));
        await Promise.all(
          imgs.map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) return resolve(true);
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
              })
          )
        );

        if (document.fonts) {
          await document.fonts.ready;
        }

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1248,
          windowHeight: 813,
        });

        document.body.removeChild(tempContainer);

        if (i > 0) {
          pdf.addPage(isA4 ? [210, 297] : [215, 330], "landscape");
        }

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(imgData, "JPEG", 0, 0, paperWidthMm, paperHeightMm, undefined, "FAST");
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("Gagal export direct PDF, fallback ke print dialog:", err);
      handlePrintNow();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintNow = () => {
    if (!containerRef.current) {
      window.print();
      return;
    }

    const fileName = getSafeFileName().replace(".pdf", "");
    const originalTitle = document.title;
    document.title = fileName;

    // Buat iframe terisolasi agar HANYA lembar-lembar F4 Lanskap yang dicetak
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) {
      window.print();
      return;
    }

    // Salin seluruh stylesheet dari halaman utama ke dalam iframe
    let stylesHtml = "";
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const sheetsHtml = containerRef.current.innerHTML;

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>${fileName}</title>
          ${stylesHtml}
          <style>
            @page {
              size: ${paperWidthStr} ${paperHeightStr} landscape;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: ${paperWidthStr} !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              font-family: Arial, Helvetica, sans-serif !important;
            }
            .print-laporan-sheet {
              width: ${paperWidthStr} !important;
              height: ${paperHeightStr} !important;
              min-height: ${paperHeightStr} !important;
              max-height: ${paperHeightStr} !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              box-sizing: border-box !important;
              padding: ${paddingStyle} !important;
              font-size: ${fontSizeStr} !important;
              line-height: 1.4 !important;
              overflow: hidden !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            .print-laporan-sheet:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${sheetsHtml}
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        document.title = originalTitle;
      }, 1000);
    }, 450);
  };

  // Label periode (hanya terisi jika difilter berdasarkan rentang tanggal tertentu)
  let labelPeriode = "";
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

  // Konfigurasi Kop, Judul & Penandatangan
  const kopType = setting?.laporanKopType || "image";
  const kopLandscapeUrl = setting?.laporanKopImageUrl || "/kop-landscape.png";
  const judulLaporan = setting?.laporanJudul || "BUKU LAPORAN KEUANGAN KAS MASJID";
  const subJudulLaporan = setting?.laporanSubJudul || "MASJID BAITUL MAGHFIRAH KLOPOSEPULUH";
  const stempelUrl = setting?.stempelImageUrl || "/uploads/1788993958297_Stample_transparat.png";

  interface LaporanSigner {
    id: string;
    peran: string;
    jabatan: string;
    nama: string;
    ttdImageUrl?: string;
    pakaiTtd: boolean;
    tampilkanStempel: boolean;
    tampilkanTanggal?: boolean;
  }

  let signers: LaporanSigner[] = [];
  if (setting?.laporanDaftarPenandatangan) {
    try {
      signers = JSON.parse(setting.laporanDaftarPenandatangan);
    } catch (e) {
      console.error("Gagal parse laporanDaftarPenandatangan:", e);
    }
  }

  if (!signers || signers.length === 0) {
    signers = [
      {
        id: "1",
        peran: "Mengetahui,",
        jabatan: "Ketua Umum DKM Masjid",
        nama: setting?.penandatanganNama || "H. Sullamul Hadi Nurmawan, S.Th.I",
        ttdImageUrl: setting?.ttdImageUrl || "/uploads/1788993992647_TTD_H_Wawan.png",
        pakaiTtd: true,
        tampilkanStempel: true,
        tampilkanTanggal: false,
      },
      {
        id: "2",
        peran: "Dibuat Oleh,",
        jabatan: "Bendahara Umum Masjid",
        nama: "H. M. Sutris",
        ttdImageUrl: "",
        pakaiTtd: false,
        tampilkanStempel: false,
        tampilkanTanggal: true,
      },
    ];
  }

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
                <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-emerald-700 text-emerald-100 font-extrabold uppercase tracking-wider">
                  {isA4 ? "A4" : "F4"} • Lanskap • {pages.length} Lembar
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Standar {isA4 ? "A4" : "Folio F4"} Lanskap ({paperWidthMm} × {paperHeightMm} mm) • Font {fontSizeStr} • Margin ({marginTop} / {marginRight} / {marginBottom} / {marginLeft})
              </p>
            </div>
          </div>

          {/* Opsi & Checklist */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
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

            {/* Tombol Simpan PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
              title="Unduh seluruh lembar sebagai berkas dokumen PDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>

            {/* Tombol Cetak Sekarang */}
            <button
              type="button"
              onClick={handlePrintNow}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl border border-slate-700 shadow-md transition active:scale-95"
              title="Buka dialog cetak ke mesin printer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>

            {/* Shortcut ke Pengaturan Komponen Cetak */}
            <Link
              href="/keuangan/pengaturan-cetak"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 shadow-md transition active:scale-95"
              title="Atur margin kertas, kop dokumen, dan pejabat penandatangan"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Atur Komponen</span>
            </Link>

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

      {/* Print Style: Folio F4 Lanskap (330mm x 215mm) atau A4 Lanskap */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${paperWidthStr} ${paperHeightStr} landscape;
                margin: 0;
              }
              body:has(.print-laporan-sheet) .print-transform-none {
                width: ${paperWidthStr} !important;
              }
            }
          `,
        }}
      />

      {/* 2. Container Lembar Kertas F4 (Dipartisi per lembar fisik F4 lanskap 330x215mm) */}
      <div className="w-full flex flex-col items-center py-6 sm:py-8 overflow-x-auto">
        <div
          ref={containerRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="print-transform-none flex flex-col items-center"
        >
          {pages.map((page) => (
            <div key={page.pageNumber} className="flex flex-col items-center mb-8 last:mb-0 print:mb-0">
              {/* Header Label Lembar Fisik (Hanya Tampil di Layar) */}
              <div
                className="no-print flex items-center justify-between mb-2 px-1"
                style={{ width: paperWidthStr }}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold text-xs shadow-xs font-mono">
                    Halaman {page.pageNumber} dari {page.totalPages}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {page.isFirstPage ? "Lembar Utama" : "Lembar Lanjutan"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Standar {isA4 ? "A4" : "F4"} Lanskap ({paperWidthMm} × {paperHeightMm} mm)
                </div>
              </div>

              {/* LEMBAR KERTAS FISIK LANSKAP */}
              <div
                className="print-laporan print-laporan-sheet is-landscape bg-white text-black shadow-2xl relative box-border flex flex-col justify-between"
                style={{
                  width: paperWidthStr,
                  height: paperHeightStr,
                  minHeight: paperHeightStr,
                  maxHeight: paperHeightStr,
                  padding: paddingStyle,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: fontSizeStr,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  pageBreakAfter: page.isLastPage ? "auto" : "always",
                  breakAfter: page.isLastPage ? "auto" : "page",
                }}
              >
                <div>
                  {/* Bagian Atas Lembar 1: KOP, JUDUL & RINGKASAN */}
                  {page.isFirstPage ? (
                    <>
                      {/* A. KOP SURAT */}
                      {tampilkanKop && kopType === "image" && (
                        <div className="mb-3 w-full flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kopLandscapeUrl}
                            alt="Kop Surat Resmi Masjid"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}

                      {tampilkanKop && kopType === "text" && (
                        <div className="mb-3 w-full pb-2 border-b-4 border-double border-black flex items-center justify-between gap-4">
                          {setting?.logoKiriUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={setting.logoKiriUrl}
                              alt="Logo Masjid"
                              className="w-16 h-16 object-contain shrink-0"
                            />
                          )}
                          <div className="text-center flex-1">
                            <h1 className="text-[13pt] font-extrabold uppercase tracking-wide text-black leading-tight">
                              {setting?.namaOrganisasi || "DEWAN KEMAKMURAN MASJID BAITUL MAGHFIRAH"}
                            </h1>
                            <p className="text-[9.5pt] text-black font-medium leading-tight mt-0.5">
                              {setting?.alamatOrganisasi || "Jl. Masjid No. 01 Kloposepuluh"}
                            </p>
                            {setting?.kontakOrganisasi && (
                              <p className="text-[8.5pt] text-neutral-600 mt-0.5">
                                {setting.kontakOrganisasi}
                              </p>
                            )}
                          </div>
                          {setting?.logoKiriUrl && <div className="w-16 shrink-0" />}
                        </div>
                      )}

                      {/* B. JUDUL & INFORMASI LAPORAN */}
                      <div className="text-center mb-3">
                        <h2 className="text-[14pt] font-extrabold uppercase tracking-wide text-black underline underline-offset-4 leading-tight">
                          {judulLaporan}
                        </h2>
                        <p className="text-[11.5pt] font-bold uppercase tracking-wide text-black mt-0.5">
                          {subJudulLaporan}
                        </p>
                        {labelPeriode && (
                          <div className="text-[11pt] font-semibold text-black mt-2 pt-1 border-t-2 border-black/60">
                            Periode: {labelPeriode}
                          </div>
                        )}
                      </div>

                      {/* C. RINGKASAN SALDO KAS */}
                      {tampilkanRingkasan && (
                        <div className="mb-3 border-2 border-black p-2.5 bg-neutral-50/50 rounded-sm">
                          <div className="text-[11pt] font-extrabold uppercase tracking-wide mb-1.5 border-b border-black/70 pb-1 flex justify-between items-center">
                            <span>Ringkasan Saldo &amp; Posisi Kas Masjid</span>
                            <span className="font-normal lowercase text-[9.5pt]">
                              (posisi per {formatIndoDate(new Date())})
                            </span>
                          </div>
                          <div className="grid grid-cols-6 gap-2 text-[10pt]">
                            <div className="border-r border-neutral-400 pr-2">
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Saldo Kas Jariyah:
                              </span>
                              <span className="block text-[11.5pt] font-bold text-black mt-0.5">
                                {stats ? formatRp(stats.saldoJariyah) : "Rp 0"}
                              </span>
                            </div>
                            <div className="border-r border-neutral-400 pr-2">
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Saldo Kas Infaq:
                              </span>
                              <span className="block text-[11.5pt] font-bold text-black mt-0.5">
                                {stats ? formatRp(stats.saldoInfaq) : "Rp 0"}
                              </span>
                            </div>
                            <div className="border-r border-neutral-400 pr-2">
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Total Saldo Kas:
                              </span>
                              <span className="block text-[11.5pt] font-extrabold text-black mt-0.5">
                                {stats ? formatRp(stats.totalSaldo) : "Rp 0"}
                              </span>
                            </div>
                            <div className="border-r border-neutral-400 pr-2">
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Pemasukan Periode:
                              </span>
                              <span className="block text-[11.5pt] font-bold text-emerald-800 mt-0.5">
                                +{formatRp(totalMasukPeriode)}
                              </span>
                            </div>
                            <div className="border-r border-neutral-400 pr-2">
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Pengeluaran Periode:
                              </span>
                              <span className="block text-[11.5pt] font-bold text-rose-800 mt-0.5">
                                -{formatRp(totalKeluarPeriode)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9.5pt] text-neutral-600 font-semibold leading-tight">
                                Surplus Kas Periode:
                              </span>
                              <span className="block text-[11.5pt] font-extrabold text-black mt-0.5">
                                {formatRp(totalMasukPeriode - totalKeluarPeriode)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Bagian Atas Lembar Lanjutan: HEADER LANJUTAN */
                    <div className="mb-3 pb-2 border-b-2 border-black">
                      <h3 className="text-[12pt] font-extrabold uppercase tracking-wide text-black">
                        {page.isSignatureOnlyPage
                          ? "LEMBAR PENGESAHAN LAPORAN KEUANGAN KAS MASJID"
                          : "LANJUTAN BUKU LAPORAN KEUANGAN KAS MASJID"}
                      </h3>
                      <p className="text-[10.5pt] font-semibold text-neutral-700">
                        MASJID BAITUL MAGHFIRAH KLOPOSEPULUH{labelPeriode ? ` • Periode: ${labelPeriode}` : ""}
                      </p>
                    </div>
                  )}

                  {/* D. TABEL TRANSAKSI (Hanya dirender jika ada baris data atau bukan halaman khusus pengesahan) */}
                  {!page.isSignatureOnlyPage && (
                    <table className="w-full text-left border-collapse text-[11pt]">
                      <thead>
                        <tr className="bg-neutral-100 border-t-2 border-b-2 border-black text-black font-bold uppercase text-[11pt]">
                          <th className="py-2 px-2 border-r border-black/40 text-center w-12">
                            No
                          </th>
                          <th className="py-2 px-2 border-r border-black/40 text-center w-28 whitespace-nowrap">
                            Tanggal
                          </th>
                          <th className="py-2 px-2 border-r border-black/40 text-center w-24 whitespace-nowrap">
                            Kas
                          </th>
                          <th className="py-2 px-3 border-r border-black/40">
                            Uraian / Keterangan Transaksi
                          </th>
                          <th className="py-2 px-3 border-r border-black/40 text-right w-36 whitespace-nowrap">
                            Penerimaan (Rp)
                          </th>
                          <th className="py-2 px-3 border-r border-black/40 text-right w-36 whitespace-nowrap">
                            Pengeluaran (Rp)
                          </th>
                          <th className="py-2 px-3 text-right w-36 whitespace-nowrap">
                            Saldo Berjalan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/20 font-normal">
                        {page.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-neutral-500 italic text-[11pt] font-normal">
                              Tidak ada catatan transaksi pada filter atau periode ini.
                            </td>
                          </tr>
                        ) : (
                          page.items.map((item) => {
                            const isMasuk = item.jenis === "MASUK";
                            return (
                              <tr key={item.id} className="border-b border-black/20 hover:bg-neutral-50 text-[11pt] font-normal">
                                <td className="py-1.5 px-2 text-center font-mono border-r border-black/30 font-normal">
                                  {item.globalIndex + 1}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono border-r border-black/30 whitespace-nowrap font-normal text-[11pt]">
                                  {formatNumericDate(item.tanggal)}
                                </td>
                                <td className="py-1.5 px-2 text-center border-r border-black/30 whitespace-nowrap font-normal">
                                  {item.kategoriKas === "JARIYAH" ? "Jariyah" : "Infaq"}
                                </td>
                                <td className="py-1.5 px-3 border-r border-black/30 font-normal">
                                  <div className="text-black leading-snug font-normal">
                                    {item.keterangan}
                                  </div>
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono border-r border-black/30 whitespace-nowrap font-normal">
                                  {isMasuk ? formatRp(item.nominal) : "-"}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono border-r border-black/30 whitespace-nowrap font-normal">
                                  {!isMasuk ? formatRp(item.nominal) : "-"}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap font-normal">
                                  {formatRp(item.saldoBerjalan)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {/* FOOTER TOTAL: Tampil di halaman terakhir yang memuat tabel transaksi */}
                      {(page.isLastPage || (page.pageNumber === page.totalPages - 1 && pages[pages.length - 1]?.isSignatureOnlyPage)) && (
                        <tfoot>
                          <tr className="bg-neutral-100 border-t-2 border-b-2 border-black font-bold text-[11pt]">
                            <td colSpan={4} className="py-2 px-3 text-right uppercase border-r border-black/40">
                              TOTAL TRANSAKSI PERIODE INI:
                            </td>
                            <td className="py-2 px-3 text-right font-mono border-r border-black/40 text-black whitespace-nowrap">
                              +{formatRp(totalMasukPeriode)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono border-r border-black/40 text-black whitespace-nowrap">
                              -{formatRp(totalKeluarPeriode)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-black whitespace-nowrap">
                              {formatRp(runningSaldo)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  )}

                  {/* Ringkasan Saldo Khusus jika Lembar ini adalah Lembar Pengesahan Mandiri */}
                  {page.isSignatureOnlyPage && (
                    <div className="mb-6 p-4 border-2 border-black bg-neutral-50/70 rounded-xs">
                      <h4 className="text-[12pt] font-extrabold uppercase mb-2 border-b border-black pb-1">
                        Rekapitulasi Akhir Transaksi
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-[11pt]">
                        <div>
                          <span className="text-neutral-600 block text-[10pt]">Total Penerimaan Kas:</span>
                          <span className="font-bold text-emerald-800 text-[12pt]">+{formatRp(totalMasukPeriode)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 block text-[10pt]">Total Pengeluaran Kas:</span>
                          <span className="font-bold text-rose-800 text-[12pt]">-{formatRp(totalKeluarPeriode)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 block text-[10pt]">Saldo Akhir Berjalan:</span>
                          <span className="font-extrabold text-black text-[12pt]">{formatRp(runningSaldo)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bagian Bawah Kertas: Lembar Pengesahan TTD ATAU Catatan Bersambung, diikuti Indikator Halaman di Dasar Kertas */}
                <div className="mt-auto pt-1 flex flex-col">
                  {page.showSignatures ? (
                    <div className="pengesahan-area pt-2 border-t-2 border-black/40 text-[12pt]">
                      <div
                        className={
                          signers.length === 1
                            ? "flex justify-end"
                            : signers.length === 2
                            ? "grid grid-cols-2 gap-8 text-center"
                            : signers.length === 3
                            ? "grid grid-cols-3 gap-6 text-center"
                            : "grid grid-cols-4 gap-4 text-center"
                        }
                      >
                        {signers.map((signer, sIdx) => (
                          <div
                            key={signer.id || sIdx}
                            className={`flex flex-col items-center justify-between min-h-[145px] ${
                              signers.length === 1 ? "w-72 text-center" : ""
                            }`}
                          >
                            <div>
                              {signer.tampilkanTanggal && (
                                <p className="font-normal text-black text-[11.5pt] mb-0.5">
                                  {setting?.kotaSurat || "Kloposepuluh"},{" "}
                                  {formatIndoDate(new Date())}
                                </p>
                              )}
                              <p className="font-normal text-black text-[12pt]">
                                {signer.peran || "Mengetahui,"}
                              </p>
                              <p className="font-bold text-black uppercase tracking-wide text-[12pt] leading-tight">
                                {signer.jabatan}
                              </p>
                            </div>

                            {/* Area TTD & Stempel Overlay */}
                            <div className="relative w-48 h-20 my-0.5 flex items-center justify-center">
                              {signer.pakaiTtd && signer.ttdImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={signer.ttdImageUrl}
                                  alt={`Tanda Tangan ${signer.nama}`}
                                  className="h-16 max-w-[170px] object-contain relative z-10"
                                />
                              ) : (
                                <div className="w-32 border-b border-dashed border-neutral-400 h-12" />
                              )}

                              {tampilkanStempel && signer.tampilkanStempel && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={stempelUrl}
                                  alt="Cap Stempel Resmi Masjid"
                                  className="absolute -left-2 -top-1 w-24 h-24 object-contain pointer-events-none mix-blend-multiply opacity-90 z-20"
                                />
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-black underline underline-offset-2 text-[12pt] leading-tight">
                                {signer.nama || "........................"}
                              </p>
                              <p className="text-[10.5pt] text-neutral-600 mt-0.5">
                                {signer.jabatan}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !page.isLastPage && (
                      <div className="pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between text-[10pt] italic text-neutral-600">
                        <span>Buku Kas Masjid Baitul Maghfirah Kloposepuluh</span>
                        <span>* Bersambung ke Halaman {page.pageNumber + 1}...</span>
                      </div>
                    )
                  )}

                  {/* Indikator Halaman di Bawah Kertas */}
                  <div className="w-full flex items-center justify-between pt-1 mt-1 border-t border-black/20 text-[9.5pt] text-neutral-500 font-mono">
                    <span className="italic">Laporan Keuangan Kas Masjid Baitul Maghfirah</span>
                    <span className="font-semibold text-black">Halaman {page.pageNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
