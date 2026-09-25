"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  BookOpen,
  BarChart3,
  PlusCircle,
  Save,
  CheckCircle2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sliders,
  FileText,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  MoveUp,
  MoveDown,
  ExternalLink,
} from "lucide-react";

interface LaporanPenandatanganItem {
  id: string;
  peran: string;
  jabatan: string;
  nama: string;
  ttdImageUrl?: string;
  pakaiTtd: boolean;
  tampilkanStempel: boolean;
  tampilkanTanggal: boolean;
}

export default function PengaturanCetakLaporanPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingKop, setUploadingKop] = useState(false);
  const [uploadingTtdIdx, setUploadingTtdIdx] = useState<number | null>(null);

  // Form State
  const [laporanMarginTop, setLaporanMarginTop] = useState(1.0);
  const [laporanMarginBottom, setLaporanMarginBottom] = useState(1.0);
  const [laporanMarginLeft, setLaporanMarginLeft] = useState(1.2);
  const [laporanMarginRight, setLaporanMarginRight] = useState(1.2);

  const [laporanKopType, setLaporanKopType] = useState("image"); // "image" | "text" | "none"
  const [laporanKopImageUrl, setLaporanKopImageUrl] = useState("/kop-landscape.png");
  const [laporanJudul, setLaporanJudul] = useState("BUKU LAPORAN KEUANGAN KAS MASJID");
  const [laporanSubJudul, setLaporanSubJudul] = useState("MASJID BAITUL MAGHFIRAH KLOPOSEPULUH");

  const [laporanUkuranKertas, setLaporanUkuranKertas] = useState("F4");
  const [laporanFontSize, setLaporanFontSize] = useState(12);

  const [laporanTampilkanKop, setLaporanTampilkanKop] = useState(true);
  const [laporanTampilkanRingkasan, setLaporanTampilkanRingkasan] = useState(true);
  const [laporanTampilkanTtd, setLaporanTampilkanTtd] = useState(true);
  const [laporanTampilkanStempel, setLaporanTampilkanStempel] = useState(true);

  const [daftarPenandatangan, setDaftarPenandatangan] = useState<LaporanPenandatanganItem[]>([]);

  // Raw Setting dari DB untuk fallback data umum (nama ketua, stempel, dll)
  const [rawSetting, setRawSetting] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setRawSetting(data);

        // Load margins
        if (data.laporanMarginTop !== undefined && data.laporanMarginTop !== null) {
          setLaporanMarginTop(Number(data.laporanMarginTop));
        }
        if (data.laporanMarginBottom !== undefined && data.laporanMarginBottom !== null) {
          setLaporanMarginBottom(Number(data.laporanMarginBottom));
        }
        if (data.laporanMarginLeft !== undefined && data.laporanMarginLeft !== null) {
          setLaporanMarginLeft(Number(data.laporanMarginLeft));
        }
        if (data.laporanMarginRight !== undefined && data.laporanMarginRight !== null) {
          setLaporanMarginRight(Number(data.laporanMarginRight));
        }

        // Load Kop & Judul
        if (data.laporanKopType) {
          setLaporanKopType(data.laporanKopType === "text" ? "image" : data.laporanKopType);
        }
        if (data.laporanKopImageUrl) setLaporanKopImageUrl(data.laporanKopImageUrl);
        if (data.laporanJudul) setLaporanJudul(data.laporanJudul);
        if (data.laporanSubJudul) setLaporanSubJudul(data.laporanSubJudul);

        // Load Kertas & Font
        if (data.laporanUkuranKertas) setLaporanUkuranKertas(data.laporanUkuranKertas);
        if (data.laporanFontSize) setLaporanFontSize(Number(data.laporanFontSize));

        // Load Defaults
        if (data.laporanTampilkanKop !== undefined) setLaporanTampilkanKop(Boolean(data.laporanTampilkanKop));
        if (data.laporanTampilkanRingkasan !== undefined) setLaporanTampilkanRingkasan(Boolean(data.laporanTampilkanRingkasan));
        if (data.laporanTampilkanTtd !== undefined) setLaporanTampilkanTtd(Boolean(data.laporanTampilkanTtd));
        if (data.laporanTampilkanStempel !== undefined) setLaporanTampilkanStempel(Boolean(data.laporanTampilkanStempel));

        // Load Penandatangan List
        let signers: LaporanPenandatanganItem[] = [];
        if (data.laporanDaftarPenandatangan) {
          try {
            signers = JSON.parse(data.laporanDaftarPenandatangan);
          } catch (e) {
            console.error("Gagal parse laporanDaftarPenandatangan:", e);
          }
        }

        // Jika belum ada konfigurasi penandatangan laporan, buat default 2 pejabat
        if (!signers || signers.length === 0) {
          signers = [
            {
              id: "signer_1",
              peran: "Mengetahui,",
              jabatan: "Ketua Umum DKM Masjid",
              nama: data.penandatanganNama || "H. Sullamul Hadi Nurmawan, S.Th.I",
              ttdImageUrl: data.ttdImageUrl || "/uploads/1788993992647_TTD_H_Wawan.png",
              pakaiTtd: true,
              tampilkanStempel: true,
              tampilkanTanggal: false,
            },
            {
              id: "signer_2",
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

        setDaftarPenandatangan(signers);
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadKop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKop(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setLaporanKopImageUrl(data.url);
      } else {
        alert("Gagal mengunggah file gambar kop");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah kop");
    } finally {
      setUploadingKop(false);
    }
  };

  const handleUploadTtd = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTtdIdx(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setDaftarPenandatangan((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], ttdImageUrl: data.url, pakaiTtd: true };
          return next;
        });
      } else {
        alert("Gagal mengunggah file scan TTD");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah scan TTD");
    } finally {
      setUploadingTtdIdx(null);
    }
  };

  const handleTambahPenandatangan = () => {
    const newId = "signer_" + Date.now();
    setDaftarPenandatangan((prev) => [
      ...prev,
      {
        id: newId,
        peran: "Menyetujui,",
        jabatan: "Sekretaris DKM",
        nama: "",
        ttdImageUrl: "",
        pakaiTtd: false,
        tampilkanStempel: false,
        tampilkanTanggal: false,
      },
    ]);
  };

  const handleHapusPenandatangan = (idx: number) => {
    if (daftarPenandatangan.length <= 1) {
      alert("Laporan keuangan minimal harus memiliki 1 penandatangan.");
      return;
    }
    setDaftarPenandatangan((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdatePenandatangan = (
    idx: number,
    field: keyof LaporanPenandatanganItem,
    value: any
  ) => {
    setDaftarPenandatangan((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleMovePenandatangan = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === daftarPenandatangan.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    setDaftarPenandatangan((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        laporanMarginTop: Number(laporanMarginTop) || 1.0,
        laporanMarginBottom: Number(laporanMarginBottom) || 1.0,
        laporanMarginLeft: Number(laporanMarginLeft) || 1.2,
        laporanMarginRight: Number(laporanMarginRight) || 1.2,
        laporanKopType,
        laporanKopImageUrl,
        laporanJudul: laporanJudul.trim(),
        laporanSubJudul: laporanSubJudul.trim(),
        laporanUkuranKertas,
        laporanFontSize: Number(laporanFontSize) || 12,
        laporanTampilkanKop,
        laporanTampilkanRingkasan,
        laporanTampilkanTtd,
        laporanTampilkanStempel,
        laporanDaftarPenandatangan: JSON.stringify(daftarPenandatangan),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert("Gagal menyimpan pengaturan cetak.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memuat pengaturan cetak laporan kas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Menu: Buku Kas, Grafik, Pengaturan Cetak, Catat */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/60">
        <div className="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/70 backdrop-blur-md">
          <Link
            href="/keuangan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Kas</span>
          </Link>
          <Link
            href="/keuangan/grafik"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/keuangan"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Ke Buku Kas</span>
          </Link>
          <Link
            href="/keuangan/catat"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Kas Baru</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Modul Keuangan &amp; Laporan</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Pengaturan Komponen Cetak Laporan Kas
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Atur tata letak margin, kop banner lanskap, format judul dokumen, serta daftar pejabat penandatangan agar laporan kas masjid tercetak rapi, profesional, dan siap audit.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="shrink-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast Sukses */}
      {saveSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500/40 text-emerald-900 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Pengaturan Berhasil Disimpan!</span> Seluruh perubahan komponen cetak (margin, kop, penandatangan, dan opsi) akan langsung diterapkan saat Anda mencetak laporan kas.
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSimpan} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* BAGIAN 1: KOP DOKUMEN & IDENTITAS */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-lg shadow-slate-900/5 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  1. Kop Dokumen Laporan
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih bentuk kop dan judul yang tampil di bagian paling atas lembar laporan kas
                </p>
              </div>
            </div>

            {/* Opsi Tipe Kop */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Model Kop Laporan:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "image", label: "Banner Gambar Lanskap", desc: "Direkomendasikan (Visual Resmi)" },
                  { id: "none", label: "Tanpa Kop Surat", desc: "Hanya Menampilkan Judul" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLaporanKopType(type.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                      laporanKopType === type.id
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold block">{type.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Unggah Banner Kop Lanskap jika tipe 'image' */}
            {laporanKopType === "image" && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Berkas Gambar Banner Kop Lanskap (330mm F4):</span>
                  <button
                    type="button"
                    onClick={() => setLaporanKopImageUrl("/kop-landscape.png")}
                    className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Gunakan Default Bawaan</span>
                  </button>
                </label>

                {/* Pratinjau Banner Kop */}
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[90px] relative overflow-hidden group">
                  {laporanKopImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={laporanKopImageUrl}
                      alt="Pratinjau Kop Laporan"
                      className="max-h-24 w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                      <ImageIcon className="w-6 h-6" />
                      <span>Belum ada gambar kop yang dipilih</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingKop ? "Mengunggah..." : "Unggah Gambar Kop Baru"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadKop}
                      disabled={uploadingKop}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Format disarankan: PNG Transparan atau JPG Lanskap (rasio ~7:1)
                  </span>
                </div>
              </div>
            )}

            {/* Input Judul & Sub Judul Laporan */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Judul Utama Laporan:
                </label>
                <input
                  type="text"
                  value={laporanJudul}
                  onChange={(e) => setLaporanJudul(e.target.value)}
                  placeholder="Contoh: BUKU LAPORAN KEUANGAN KAS MASJID"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sub-Judul / Nama Lembaga Masjid:
                </label>
                <input
                  type="text"
                  value={laporanSubJudul}
                  onChange={(e) => setLaporanSubJudul(e.target.value)}
                  placeholder="Contoh: MASJID BAITUL MAGHFIRAH KLOPOSEPULUH"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: TATA LETAK, KERTAS & MARGIN */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-lg shadow-slate-900/5 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  2. Tata Letak Kertas &amp; Margin
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan batas tepi cetak (margin) dan ukuran huruf fisik agar pas di mesin printer
                </p>
              </div>
            </div>

            {/* Pilihan Ukuran Kertas & Font */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Format Ukuran Kertas:
                </label>
                <select
                  value={laporanUkuranKertas}
                  onChange={(e) => setLaporanUkuranKertas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                >
                  <option value="F4">Folio / F4 Lanskap (330 × 215 mm) [Standar]</option>
                  <option value="A4">A4 Lanskap (297 × 210 mm)</option>
                </select>
                <span className="text-[10.5px] text-slate-500 mt-1 block">
                  Orientasi dokumen selalu Lanskap horizontal
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ukuran Huruf Dokumen:
                </label>
                <select
                  value={laporanFontSize}
                  onChange={(e) => setLaporanFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                >
                  <option value={10}>10 pt (Kecil / Lebih Banyak Baris Transaksi)</option>
                  <option value={11}>11 pt (Sedang / Proporsional)</option>
                  <option value={12}>12 pt (Standar / Sangat Mudah Dibaca)</option>
                </select>
                <span className="text-[10.5px] text-slate-500 mt-1 block">
                  Menentukan kepadatan baris tabel transaksi per lembar
                </span>
              </div>
            </div>

            {/* Input Margin 4 Sisi (dalam CM) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Batas Tepi Cetak (Margin dalam satuan Centimeter - cm):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLaporanMarginTop(1.0);
                    setLaporanMarginBottom(1.0);
                    setLaporanMarginLeft(1.2);
                    setLaporanMarginRight(1.2);
                  }}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default (1.0 &amp; 1.2 cm)</span>
                </button>
              </div>

              {/* Visual Box Margin Controller */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center gap-2 text-xs">
                {/* Margin Atas */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Atas:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={laporanMarginTop}
                    onChange={(e) => setLaporanMarginTop(parseFloat(e.target.value) || 1.0)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                  />
                  <span className="text-slate-500">cm</span>
                </div>

                {/* Margin Kiri & Kanan */}
                <div className="flex items-center justify-between w-full max-w-sm px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600">Kiri:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={laporanMarginLeft}
                      onChange={(e) => setLaporanMarginLeft(parseFloat(e.target.value) || 1.2)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                    />
                    <span className="text-slate-500">cm</span>
                  </div>

                  <div className="w-24 h-12 bg-white rounded-lg border border-dashed border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                    Area Cetak
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600">Kanan:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={laporanMarginRight}
                      onChange={(e) => setLaporanMarginRight(parseFloat(e.target.value) || 1.2)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                    />
                    <span className="text-slate-500">cm</span>
                  </div>
                </div>

                {/* Margin Bawah */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Bawah:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={laporanMarginBottom}
                    onChange={(e) => setLaporanMarginBottom(parseFloat(e.target.value) || 1.0)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                  />
                  <span className="text-slate-500">cm</span>
                </div>
              </div>
            </div>

            {/* Checklist Opsi Bawaan Toolbar */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Opsi Tampilan Default (Saat Membuka Pratinjau):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={laporanTampilkanKop}
                    onChange={(e) => setLaporanTampilkanKop(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Tampilkan Kop Surat</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={laporanTampilkanRingkasan}
                    onChange={(e) => setLaporanTampilkanRingkasan(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Tampilkan Ringkasan Saldo</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={laporanTampilkanTtd}
                    onChange={(e) => setLaporanTampilkanTtd(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Tampilkan Kolom Tanda Tangan</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={laporanTampilkanStempel}
                    onChange={(e) => setLaporanTampilkanStempel(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Tampilkan Cap Stempel Resmi</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* BAGIAN 3: DAFTAR PENANDATANGAN & PENGESAHAN LAPORAN */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-lg shadow-slate-900/5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  3. Pejabat Penandatangan Laporan Kas ({daftarPenandatangan.length} Orang)
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasikan pejabat yang mengesahkan laporan (Ketua Takmir, Bendahara, Sekretaris, dll.), lengkap dengan scan TTD dan cap stempel
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTambahPenandatangan}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah Penandatangan</span>
            </button>
          </div>

          {/* Daftar Kartu Penandatangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daftarPenandatangan.map((signer, idx) => (
              <div
                key={signer.id || idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5 relative hover:border-slate-300 transition"
              >
                {/* Header Kartu Penandatangan */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      {signer.jabatan || `Penandatangan ${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePenandatangan(idx, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition"
                      title="Geser ke kiri / urutan sebelumnya"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === daftarPenandatangan.length - 1}
                      onClick={() => handleMovePenandatangan(idx, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition"
                      title="Geser ke kanan / urutan berikutnya"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    {daftarPenandatangan.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleHapusPenandatangan(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition ml-1"
                        title="Hapus Penandatangan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields Per Penandatangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Teks Peran / Keterangan:
                    </label>
                    <input
                      type="text"
                      value={signer.peran}
                      onChange={(e) => handleUpdatePenandatangan(idx, "peran", e.target.value)}
                      placeholder="Contoh: Mengetahui, / Dibuat Oleh,"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Jabatan Resmi:
                    </label>
                    <input
                      type="text"
                      value={signer.jabatan}
                      onChange={(e) => handleUpdatePenandatangan(idx, "jabatan", e.target.value)}
                      placeholder="Contoh: Ketua DKM / Bendahara"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nama Lengkap &amp; Gelar Pejabat:
                  </label>
                  <input
                    type="text"
                    value={signer.nama}
                    onChange={(e) => handleUpdatePenandatangan(idx, "nama", e.target.value)}
                    placeholder="Contoh: H. Sullamul Hadi Nurmawan, S.Th.I"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Section Unggah TTD Selalu Tampil untuk Setiap Penandatangan */}
                <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unggah TTD Pejabat Ini:</span>
                    </label>
                    {signer.ttdImageUrl ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        Scan TTD Siap
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-medium">
                        Belum Ada File
                      </span>
                    )}
                  </div>

                  {/* Kotak Preview & Tombol Unggah TTD */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden relative">
                        {signer.ttdImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={signer.ttdImageUrl}
                            alt={`Scan TTD ${signer.nama}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4 opacity-50" />
                            <span className="text-[9px] italic mt-0.5">Kosong</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {signer.ttdImageUrl ? "Berkas Scan Terpasang" : "Belum Ada Berkas Scan TTD"}
                        </span>
                        <span className="text-[10.5px] text-slate-500 block">
                          Format PNG transparan atau JPG
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="cursor-pointer px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-xs">
                        <Upload className="w-3 h-3 text-emerald-400" />
                        <span>{uploadingTtdIdx === idx ? "Mengunggah..." : signer.ttdImageUrl ? "Ganti TTD" : "Unggah TTD"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadTtd(idx, e)}
                          disabled={uploadingTtdIdx === idx}
                          className="hidden"
                        />
                      </label>

                      {signer.ttdImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdatePenandatangan(idx, "ttdImageUrl", "");
                            handleUpdatePenandatangan(idx, "pakaiTtd", false);
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus Scan TTD ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Checkbox Opsi: Pakai TTD Digital, Stempel, Tanggal */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={signer.pakaiTtd}
                        onChange={(e) =>
                          handleUpdatePenandatangan(idx, "pakaiTtd", e.target.checked)
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Tampilkan Scan TTD Digital</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={signer.tampilkanStempel}
                        onChange={(e) =>
                          handleUpdatePenandatangan(idx, "tampilkanStempel", e.target.checked)
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Bubuhkan Cap Stempel</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={signer.tampilkanTanggal}
                        onChange={(e) =>
                          handleUpdatePenandatangan(idx, "tampilkanTanggal", e.target.checked)
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Sertakan Kota &amp; Tanggal</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Bawah */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link
            href="/keuangan"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            &larr; Kembali ke Buku Kas Masjid
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-700/25 transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan Cetak</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
