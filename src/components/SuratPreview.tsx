"use client";

import React, { useState, useRef } from "react";
import {
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  FileDown,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { formatIndoDate, formatHijriDate } from "@/lib/utils";
import ModalKirimSuratWA from "@/components/ModalKirimSuratWA";

export interface SuratPreviewProps {
  surat: {
    nomorSurat: string;
    tanggalSurat: string | Date;
    lampiran?: string;
    perihal: string;
    tujuan: string;
    alamatTujuan?: string;
    salamPembuka?: string;
    kalimatPembuka?: string;
    isiSurat: string;
    adaAcara?: boolean;
    acaraHariTanggal?: string;
    acaraWaktu?: string;
    acaraTempat?: string;
    acaraAgenda?: string;
    kalimatPenutup?: string;
    salamPenutup?: string;
    tempatSurat?: string;
    namaPenandatangan: string;
    jabatanPenandatangan: string;
    namaPenandatangan2?: string;
    jabatanPenandatangan2?: string;
    pakaiTtd?: boolean;
    pakaiTtd2?: boolean;
    pakaiStempel?: boolean;
    tembusan?: string;
    penandatanganList?: any;
  };
  setting?: {
    namaOrganisasi?: string;
    alamatOrganisasi?: string;
    kontakOrganisasi?: string;
    daftarPenandatangan?: any;
    kopType?: string;
    kopImageUrl?: string;
    logoKiriUrl?: string;
    logoKananUrl?: string;
    garisKop?: boolean;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    paragrafSpacing?: number;
    penandatanganNama?: string;
    penandatanganJabatan?: string;
    penandatanganNama2?: string;
    penandatanganJabatan2?: string;
    ttdImageUrl?: string;
    ttdImage2Url?: string;
    stempelImageUrl?: string;
    stempelPosisiX?: number;
    stempelPosisiY?: number;
    stempelUkuran?: number;
    stempelOpacity?: number;
    kotaSurat?: string;
    defaultSalamPembuka?: string;
    defaultSalamPenutup?: string;
    defaultKalimatPembuka?: string;
    defaultKalimatPenutup?: string;
    [key: string]: any;
  };
  hideActions?: boolean;
}

export default function SuratPreview({
  surat,
  setting = {},
  hideActions = false,
}: SuratPreviewProps) {
  const [zoom, setZoom] = useState<number>(0.75); // Skala pratinjau pas di layar
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const getSafeFileName = () => {
    const rawNomor = surat.nomorSurat || "001";
    const cleanNomor = rawNomor.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
    const rawPerihal = surat.perihal || "Surat_Keluar";
    const cleanPerihal = rawPerihal.replace(/[/\\?%*:|"<>]/g, "").replace(/\s+/g, "_");
    return `${cleanNomor}_${cleanPerihal}.pdf`;
  };

  const getCleanTujuan = (raw?: string) => {
    if (!raw) return "Penerima Surat";
    let cleaned = raw.trim();
    // Bersihkan awalan Kepada jika ada
    cleaned = cleaned.replace(/^kepada\s*[:,-]?\s*/i, "");
    // Bersihkan awalan Yth jika ada
    cleaned = cleaned.replace(/^yth\s*[:.,-]?\s*/i, "");
    return cleaned.trim() || "Penerima Surat";
  };

  const getCleanAlamat = (raw?: string) => {
    if (!raw || !raw.trim()) return "di, Tempat";
    const trimmed = raw.trim();
    if (trimmed.toLowerCase() === "di tempat" || trimmed.toLowerCase() === "di, tempat") {
      return "di, Tempat";
    }
    return trimmed;
  };

  const handlePrint = () => {
    if (!sheetRef.current) {
      window.print();
      return;
    }

    const originalTitle = document.title;
    const fileName = getSafeFileName().replace(/\.pdf$/, "");
    document.title = fileName;

    // Buat iframe terisolasi agar HANYA lembar surat F4 yang dicetak (bebas border card luar, background abu-abu, & layout halaman)
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

    const sheetHtml = sheetRef.current.outerHTML;

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          ${stylesHtml}
          <style>
            @page {
              size: 215mm 330mm;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              width: 215mm !important;
              height: 330mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-sheet {
              width: 215mm !important;
              height: 330mm !important;
              min-height: 330mm !important;
              max-height: 330mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${sheetHtml}
        </body>
      </html>
    `);
    pri.document.close();

    // Tunggu gambar dan font selesai dimuat sebelum membuka dialog cetak
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

  const handleDownloadPdf = async () => {
    if (!sheetRef.current) return;
    setIsExportingPdf(true);

    const fileName = getSafeFileName();

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Clone target element agar tidak terpengaruh scale zoom preview
      const sourceEl = sheetRef.current;
      const clone = sourceEl.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.boxShadow = "none";
      clone.style.margin = "0";
      clone.style.width = "215mm";
      clone.style.minHeight = "330mm";
      clone.style.maxHeight = "330mm";
      clone.style.height = "330mm";
      clone.style.boxSizing = "border-box";
      clone.style.overflow = "hidden";

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "215mm";
      container.style.height = "330mm";
      container.style.zIndex = "-99999";
      container.style.pointerEvents = "none";
      container.style.backgroundColor = "#ffffff";
      container.appendChild(clone);
      document.body.appendChild(container);

      // Tunggu seluruh gambar (kop, ttd, stempel) selesai dimuat
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

      // Render kanvas dengan resolusi tinggi (scale 2)
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 813,
      });

      document.body.removeChild(container);

      // Buat dokumen jsPDF ukuran standar F4 (215 x 330 mm) tepat 1 halaman
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215, 330],
        compress: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      // Paskan gambar ke tepat 1 lembar F4 penuh tanpa pernah membuat halaman kedua
      pdf.addImage(imgData, "JPEG", 0, 0, 215, 330, undefined, "FAST");
      pdf.save(fileName);
    } catch (err) {
      console.error("Gagal export direct PDF, fallback ke print dialog:", err);
      const originalTitle = document.title;
      document.title = fileName.replace(/\.pdf$/, "");
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Setting defaults
  const marginTop = setting.marginTop ?? 2.0;
  const marginBottom = setting.marginBottom ?? 2.0;
  const marginLeft = setting.marginLeft ?? 2.5;
  const marginRight = setting.marginRight ?? 2.0;
  const fontFamily = setting.fontFamily || "Times New Roman";
  const fontSize = setting.fontSize || 12;
  const lineHeight = setting.lineHeight || 1.35;
  const paragrafSpacing = setting.paragrafSpacing || 0.8;
  const colonOffset = "1.8cm";

  const stempelX = setting.stempelPosisiX ?? -25;
  const stempelY = setting.stempelPosisiY ?? -15;
  const stempelSize = setting.stempelUkuran ?? 105;
  const stempelOpacity = setting.stempelOpacity ?? 0.85;

  const logoKiri = setting.logoKiriUrl || "/logo-masjid.svg";
  const logoKanan = setting.logoKananUrl;
  const ttdImg = setting.ttdImageUrl || "/sample-ttd.svg";
  const stempelImg = setting.stempelImageUrl || "/sample-stempel.svg";

  // Resolusi daftar penandatangan aktif
  let activeSigners: {
    id: string;
    nama: string;
    jabatan: string;
    ttdImageUrl?: string;
    pakaiTtd: boolean;
  }[] = [];

  if (surat.penandatanganList) {
    try {
      activeSigners =
        typeof surat.penandatanganList === "string"
          ? JSON.parse(surat.penandatanganList)
          : surat.penandatanganList;
    } catch (e) {
      console.error("Gagal parse penandatanganList di SuratPreview:", e);
    }
  }

  // Fallback ke data legacy jika penandatanganList kosong
  if (!Array.isArray(activeSigners) || activeSigners.length === 0) {
    const p1Nama = surat.namaPenandatangan || setting.penandatanganNama || "";
    const p1Jabatan = surat.jabatanPenandatangan || setting.penandatanganJabatan || "Ketua";
    const p2Nama = surat.namaPenandatangan2 || setting.penandatanganNama2 || "";
    const p2Jabatan = surat.jabatanPenandatangan2 || setting.penandatanganJabatan2 || "Sekretaris";

    if (p1Nama) {
      activeSigners.push({
        id: "1",
        nama: p1Nama,
        jabatan: p1Jabatan,
        ttdImageUrl: setting.ttdImageUrl || "/sample-ttd.svg",
        pakaiTtd: surat.pakaiTtd !== false,
      });
    }

    if (p2Nama) {
      activeSigners.push({
        id: "2",
        nama: p2Nama,
        jabatan: p2Jabatan,
        ttdImageUrl: setting.ttdImage2Url || "/sample-ttd.svg",
        pakaiTtd: surat.pakaiTtd2 === true,
      });
    }
  }

  // Lengkapi fallback ttdImageUrl dari daftar master jika kosong
  let masterSigners: any[] = [];
  if (setting.daftarPenandatangan) {
    try {
      masterSigners =
        typeof setting.daftarPenandatangan === "string"
          ? JSON.parse(setting.daftarPenandatangan)
          : setting.daftarPenandatangan;
    } catch (e) {}
  }

  activeSigners = activeSigners.map((s, idx) => {
    let url = s.ttdImageUrl;
    if (!url) {
      const match = masterSigners.find(
        (m) => m.nama?.trim().toLowerCase() === s.nama?.trim().toLowerCase()
      );
      if (match?.ttdImageUrl) {
        url = match.ttdImageUrl;
      } else if (idx === 0) {
        url = setting.ttdImageUrl || "/sample-ttd.svg";
      } else if (idx === 1) {
        url = setting.ttdImage2Url || "/sample-ttd.svg";
      }
    }
    return {
      ...s,
      ttdImageUrl: url || "/sample-ttd.svg",
    };
  });

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Bar (Preview Controls) */}
      {!hideActions && (
        <div className="no-print sticky top-4 z-20 mb-4 bg-white/50 backdrop-blur-md border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 max-w-2xl w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Ukuran F4 (Folio)
            </span>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.1).toFixed(2))))}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition"
                title="Zoom Out (hingga 30%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <select
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                className="text-xs font-semibold text-slate-700 bg-transparent py-0.5 px-1 rounded hover:bg-white focus:outline-none cursor-pointer"
                title="Pilih Skala Zoom"
              >
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
                <option value={60}>60%</option>
                <option value={75}>75% (Normal)</option>
                <option value={90}>90%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                {![30, 40, 50, 60, 75, 90, 100, 125].includes(Math.round(zoom * 100)) && (
                  <option value={Math.round(zoom * 100)}>{Math.round(zoom * 100)}%</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.75)}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition ml-1"
                title="Reset Zoom (75%)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tombol Simpan PDF (Hijau Logo) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              title="Unduh langsung sebagai file dokumen PDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>

            {/* Tombol Cetak (Oranye Logo) */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-orange-500/25 transition-all active:scale-95"
              title="Buka dialog cetak ke printer fisik"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>

            {/* Tombol Kirim WhatsApp Pengurus (Hijau Tua) */}
            <button
              type="button"
              onClick={() => setIsWaModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800 to-green-900 hover:from-emerald-900 hover:to-green-950 text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-900/20 transition-all active:scale-95"
              title="Kirim surat ke WhatsApp pengurus secara otomatis dengan nama personal"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Kirim WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Sheet Container with Zoom Scale for Display */}
      <div className="w-full flex justify-center overflow-x-auto pb-4 pt-1">
        <div
          className="relative print-transform-none flex justify-center flex-shrink-0"
          style={{
            width: `calc(215mm * ${zoom})`,
            height: `calc(330mm * ${zoom})`,
            transition: "width 0.15s ease-out, height 0.15s ease-out",
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
              width: "215mm",
              height: "330mm",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* Exact F4 Sheet (215mm x 330mm) */}
            <div
              ref={sheetRef}
              className="print-sheet bg-white shadow-2xl text-black relative box-border selection:bg-purple-100 flex flex-col justify-between"
              style={{
                width: "215mm",
                height: "330mm",
                minHeight: "330mm",
                maxHeight: "330mm",
                overflow: "hidden",
                paddingTop: `${marginTop}cm`,
                paddingBottom: `${marginBottom}cm`,
                paddingLeft: `${marginLeft}cm`,
                paddingRight: `${marginRight}cm`,
                fontFamily: fontFamily,
                fontSize: `${fontSize}pt`,
                lineHeight: lineHeight,
              }}
            >
            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col">
              {/* KOP SURAT (BANNER GAMBAR) - 100% */}
              {setting.kopImageUrl && (
                <div className="mb-2.5 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setting.kopImageUrl}
                    alt="Kop Surat"
                    className="w-full object-contain"
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              )}

              {/* BARIS IDENTITAS SURAT & TANGGAL */}
              <div className="flex justify-between items-start mb-2 text-[11pt]">
                {/* Kolom Kiri: Nomor, Hal, Lamp */}
                <table className="leading-snug">
                  <tbody>
                    <tr>
                      <td style={{ width: colonOffset }} className="font-normal align-top whitespace-nowrap">
                        Nomor
                      </td>
                      <td className="pr-2 align-top">:</td>
                      <td className="font-normal align-top">
                        {surat.nomorSurat || "001/PM-BM/UND/08/2026"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: colonOffset }} className="font-normal align-top whitespace-nowrap">
                        Hal
                      </td>
                      <td className="pr-2 align-top">:</td>
                      <td className="font-normal align-top">
                        {surat.perihal || "Perihal Surat"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: colonOffset }} className="font-normal align-top whitespace-nowrap">
                        Lamp
                      </td>
                      <td className="pr-2 align-top">:</td>
                      <td className="font-normal align-top">{surat.lampiran || "-"}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Kolom Kanan: Tempat, Tanggal Masehi & Tanggal Hijriyah */}
                <div className="text-right leading-snug whitespace-nowrap">
                  <p>
                    {surat.tempatSurat || setting.kotaSurat || "Jakarta"},{" "}
                    {formatIndoDate(surat.tanggalSurat || new Date())} M
                  </p>
                  {formatHijriDate(surat.tanggalSurat || new Date()) && (
                    <p className="mt-0.5 text-black">
                      {formatHijriDate(surat.tanggalSurat || new Date())}
                    </p>
                  )}
                </div>
              </div>

              {/* KONTEN SURAT (SEJAJAR DENGAN TITIK DUA NOMOR/HAL/LAMP) */}
              <div style={{ paddingLeft: colonOffset }} className="flex flex-col">
                {/* TUJUAN SURAT / PENERIMA */}
                {(() => {
                  const cleanTujuan = getCleanTujuan(surat.tujuan);
                  const isMultilineTujuan = cleanTujuan.includes("\n");
                  return (
                    <div className="mt-2 mb-2.5 text-[11pt] leading-snug">
                      <p className="font-normal text-black mb-0.5">Kepada,</p>
                      {isMultilineTujuan ? (
                        <div className="font-normal text-black leading-relaxed">
                          <p>Yth.</p>
                          <div
                            id="tujuan-surat-content"
                            className="font-bold text-black whitespace-pre-line"
                          >
                            {cleanTujuan}
                          </div>
                        </div>
                      ) : (
                        <p className="font-normal text-black leading-relaxed">
                          <span>Yth. </span>
                          <span
                            id="tujuan-surat-content"
                            className="font-bold text-black whitespace-pre-line"
                          >
                            {cleanTujuan}
                          </span>
                        </p>
                      )}
                      <p className="text-black mt-1 leading-snug whitespace-pre-line">
                        {getCleanAlamat(surat.alamatTujuan)}
                      </p>
                    </div>
                  );
                })()}

                {/* SALAM PEMBUKA */}
                <div className="my-2 font-bold italic text-[11pt] text-black">
                  {surat.salamPembuka ||
                    setting.defaultSalamPembuka ||
                    "Assalamu'alaikum Warahmatullahi Wabarakatuh,"}
                </div>

                {/* KALIMAT PEMBUKA */}
                {surat.kalimatPembuka && (
                  <p
                    className="text-justify leading-relaxed text-black"
                    style={{ marginBottom: `${paragrafSpacing}rem` }}
                  >
                    {surat.kalimatPembuka}
                  </p>
                )}

                {/* ISI SURAT */}
                <div
                  className="text-justify leading-relaxed text-black whitespace-pre-line"
                  style={{ marginBottom: `${paragrafSpacing}rem` }}
                >
                  {surat.isiSurat}
                </div>

                {/* BLOK RINCIAN ACARA / KEGIATAN (LEBIH MENJOROK LAGI 0.5 CM) */}
                {surat.adaAcara && (
                  <div className="my-3" style={{ paddingLeft: "0.5cm" }}>
                    <table className="text-[11pt] leading-normal w-full">
                      <tbody>
                        {surat.acaraHariTanggal && (
                          <tr>
                            <td style={{ width: "3.2cm" }} className="align-top font-bold text-black py-0.5 whitespace-nowrap">
                              Hari / Tanggal
                            </td>
                            <td className="w-4 align-top font-bold text-black py-0.5">:</td>
                            <td className="align-top font-bold text-black py-0.5">
                              {surat.acaraHariTanggal}
                            </td>
                          </tr>
                        )}
                        {surat.acaraWaktu && (
                          <tr>
                            <td style={{ width: "3.2cm" }} className="align-top font-bold text-black py-0.5 whitespace-nowrap">
                              Waktu
                            </td>
                            <td className="w-4 align-top font-bold text-black py-0.5">:</td>
                            <td className="align-top font-bold text-black py-0.5">
                              {surat.acaraWaktu}
                            </td>
                          </tr>
                        )}
                        {surat.acaraTempat && (
                          <tr>
                            <td style={{ width: "3.2cm" }} className="align-top font-bold text-black py-0.5 whitespace-nowrap">
                              Tempat
                            </td>
                            <td className="w-4 align-top font-bold text-black py-0.5">:</td>
                            <td className="align-top font-bold text-black py-0.5">
                              {surat.acaraTempat}
                            </td>
                          </tr>
                        )}
                        {surat.acaraAgenda && (
                          <tr>
                            <td style={{ width: "3.2cm" }} className="align-top font-bold text-black py-0.5 whitespace-nowrap">
                              {surat.perihal?.toLowerCase().includes("tugas") || surat.perihal?.toLowerCase().includes("mandat")
                                ? "Agenda / Tugas"
                                : "Agenda / Acara"}
                            </td>
                            <td className="w-4 align-top font-bold text-black py-0.5">:</td>
                            <td className="align-top font-bold text-black py-0.5 whitespace-pre-line">
                              {surat.acaraAgenda}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* KALIMAT PENUTUP */}
                {surat.kalimatPenutup && (
                  <p
                    className="text-justify leading-relaxed text-black"
                    style={{ marginBottom: `${paragrafSpacing}rem` }}
                  >
                    {surat.kalimatPenutup}
                  </p>
                )}

                {/* SALAM PENUTUP */}
                <div className="mt-2 mb-3 font-bold italic text-[11pt] text-black">
                  {surat.salamPenutup ||
                    setting.defaultSalamPenutup ||
                    "Wassalamu'alaikum Warahmatullahi Wabarakatuh"}
                </div>

                {/* AREA PENGESAHAN / TANDA TANGAN & STEMPEL */}
                <div className="mt-3 break-inside-avoid">
                  <p className="text-center font-bold mb-2 uppercase text-[11pt] tracking-wide text-black whitespace-pre-line">
                    {setting.namaOrganisasi || "PENGURUS MASJID"}
                  </p>

                  {activeSigners.length === 1 ? (
                    /* Format Satu Penandatangan (Tunggal) */
                    <div className="flex justify-end pr-8">
                      <div className="w-64 text-center relative">
                        <p className="font-bold text-[11pt] text-black">
                          {activeSigners[0].jabatan || "Ketua"}
                        </p>
                        <div className="h-16 flex items-center justify-center relative my-0.5">
                          {activeSigners[0].pakaiTtd !== false && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={activeSigners[0].ttdImageUrl || ttdImg}
                              alt="Tanda Tangan"
                              className="max-h-14 max-w-40 object-contain"
                            />
                          )}

                          {/* Cap Stempel Overlay */}
                          {surat.pakaiStempel !== false && (
                            <div
                              className="absolute pointer-events-none select-none z-10"
                              style={{
                                left: `calc(50% + ${stempelX}px)`,
                                top: `calc(50% + ${stempelY}px)`,
                                transform: "translate(-50%, -50%) rotate(-5deg)",
                                opacity: stempelOpacity,
                                width: `${stempelSize}px`,
                                height: `${stempelSize}px`,
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={stempelImg}
                                alt="Stempel Cap"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <p className="font-bold underline text-[11pt] text-black">
                          {activeSigners[0].nama || "Nama Penandatangan"}
                        </p>
                      </div>
                    </div>
                  ) : activeSigners.length === 3 ? (
                    /* Format Tiga Penandatangan (3 Kolom Berdampingan) */
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {activeSigners.map((signer, idx) => (
                        <div key={signer.id || idx} className="flex flex-col items-center relative">
                          <p className="font-bold text-[10.5pt] text-black leading-tight min-h-[2.5rem] flex items-center justify-center">
                            {signer.jabatan}
                          </p>
                          <div className="h-16 flex items-center justify-center relative my-0.5 w-full">
                            {signer.pakaiTtd !== false && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={signer.ttdImageUrl || ttdImg}
                                alt={`Tanda Tangan ${idx + 1}`}
                                className="max-h-14 max-w-36 object-contain"
                              />
                            )}

                            {/* Cap Stempel di penandatangan kanan */}
                            {idx === 2 && surat.pakaiStempel !== false && (
                              <div
                                className="absolute pointer-events-none select-none z-10"
                                style={{
                                  left: `calc(50% + ${stempelX}px)`,
                                  top: `calc(50% + ${stempelY}px)`,
                                  transform: "translate(-50%, -50%) rotate(-4deg)",
                                  opacity: stempelOpacity,
                                  width: `${stempelSize}px`,
                                  height: `${stempelSize}px`,
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stempelImg}
                                  alt="Stempel Cap"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <p className="font-bold underline text-[10.5pt] text-black">
                            {signer.nama}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : activeSigners.length >= 4 ? (
                    /* Format Empat atau Lebih Penandatangan (Grid 2 Kolom) */
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-center">
                      {activeSigners.map((signer, idx) => (
                        <div key={signer.id || idx} className="flex flex-col items-center relative">
                          <p className="font-bold text-[10.5pt] text-black">
                            {signer.jabatan}
                          </p>
                          <div className="h-16 flex items-center justify-center relative my-0.5 w-full">
                            {signer.pakaiTtd !== false && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={signer.ttdImageUrl || ttdImg}
                                alt={`Tanda Tangan ${idx + 1}`}
                                className="max-h-14 max-w-40 object-contain"
                              />
                            )}

                            {/* Cap Stempel */}
                            {idx === 1 && surat.pakaiStempel !== false && (
                              <div
                                className="absolute pointer-events-none select-none z-10"
                                style={{
                                  left: `calc(50% + ${stempelX}px)`,
                                  top: `calc(50% + ${stempelY}px)`,
                                  transform: "translate(-50%, -50%) rotate(-4deg)",
                                  opacity: stempelOpacity,
                                  width: `${stempelSize}px`,
                                  height: `${stempelSize}px`,
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stempelImg}
                                  alt="Stempel Cap"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <p className="font-bold underline text-[10.5pt] text-black">
                            {signer.nama}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Format Dua Penandatangan (Kiri & Kanan Standar) */
                    <div className="grid grid-cols-2 gap-8 text-center">
                      {activeSigners.map((signer, idx) => (
                        <div key={signer.id || idx} className="flex flex-col items-center relative">
                          <p className="font-bold text-[11pt] text-black">
                            {signer.jabatan}
                          </p>
                          <div className="h-16 flex items-center justify-center relative my-0.5 w-full">
                            {signer.pakaiTtd !== false && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={signer.ttdImageUrl || ttdImg}
                                alt={`Tanda Tangan ${idx + 1}`}
                                className="max-h-14 max-w-40 object-contain"
                              />
                            )}

                            {/* Cap Stempel Overlay di Penandatangan Kanan */}
                            {idx === 1 && surat.pakaiStempel !== false && (
                              <div
                                className="absolute pointer-events-none select-none z-10"
                                style={{
                                  left: `calc(50% + ${stempelX}px)`,
                                  top: `calc(50% + ${stempelY}px)`,
                                  transform: "translate(-50%, -50%) rotate(-4deg)",
                                  opacity: stempelOpacity,
                                  width: `${stempelSize}px`,
                                  height: `${stempelSize}px`,
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stempelImg}
                                  alt="Stempel Cap"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <p className="font-bold underline text-[11pt] text-black">
                            {signer.nama}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TEMBUSAN (JIKA ADA) */}
              {surat.tembusan && (
                <div className="mt-4 text-[9.5pt] leading-tight text-slate-800 break-inside-avoid">
                  <p className="font-semibold underline mb-0.5">Tembusan Yth.:</p>
                  <div className="whitespace-pre-line pl-3">
                    {surat.tembusan}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modal Kirim WhatsApp Pengurus */}
      <ModalKirimSuratWA
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        surat={surat}
        setting={setting}
        sheetRef={sheetRef}
      />
    </div>
  );
}
