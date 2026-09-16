"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Archive,
  Download,
  UploadCloud,
  FileCheck2,
  HardDrive,
  ShieldCheck,
  Clock,
  FileText,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  Info,
  Layers,
  ArrowLeft,
} from "lucide-react";

interface BackupInfo {
  database: {
    exists: boolean;
    path: string;
    size: number;
    sizeFormatted: string;
    lastModified: string | null;
  };
  counts: {
    suratKeluar: number;
    suratMasuk: number;
    kasMasjid: number;
    pengurus: number;
    kegiatanJumat: number;
    kegiatanMingguan: number;
    kegiatanBulanan: number;
    saranJamaah: number;
    users: number;
    totalRecords: number;
  };
  uploads: {
    count: number;
    size: number;
    sizeFormatted: string;
    path: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    serverTime: string;
  };
}

export default function BackupPage() {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Restore states
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const fetchBackupInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backup?type=info");
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
      }
    } catch (err) {
      console.error("Gagal memuat status cadangan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  const handleDownload = (type: "all" | "database" | "uploads") => {
    setDownloadingType(type);
    // Langsung trigger browser download via link endpoint
    const url = `/api/backup?type=${type}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingType(null);
    }, 2500);
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    setRestoring(true);
    setRestoreError(null);
    setRestoreSuccess(null);

    const formData = new FormData();
    formData.append("file", restoreFile);

    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memulihkan database.");
      }

      setRestoreSuccess(
        `Database berhasil dipulihkan dari "${data.fileName}" (${data.fileSizeFormatted}). Halaman akan memuat ulang data.`
      );
      setRestoreFile(null);
      setConfirmModal(false);
      fetchBackupInfo();
    } catch (err: any) {
      setRestoreError(err.message || "Terjadi kesalahan saat memulihkan database.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/75 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Cadangan & Backup Data
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-800 border border-amber-500/30 uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pencadangan berkala database catatan kas, persuratan, agenda dakwah, serta seluruh berkas fisik masjid.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchBackupInfo}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Segarkan Status</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Status & Kapasitas Penyimpanan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Database Stats */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              SQLite Aktif
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {loading ? "..." : info?.database?.sizeFormatted || "0 B"}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Ukuran Database Utama (`prisma/dev.db`)
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Terakhir Diubah:</span>
            <span className="font-medium text-slate-600">
              {info?.database?.lastModified
                ? new Date(info.database.lastModified).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        </div>

        {/* Berkas Arsip Uploads */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/70">
              {loading ? "..." : `${info?.uploads?.count || 0} File`}
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {loading ? "..." : info?.uploads?.sizeFormatted || "0 B"}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Total Berkas Arsip Fisik (`public/uploads`)
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Isi Folder:</span>
            <span className="font-medium text-slate-600">PDF Surat, Bukti Nota & QRIS</span>
          </div>
        </div>

        {/* Total Rekap Data Catatan */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
              Terverifikasi
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {loading ? "..." : `${info?.counts?.totalRecords || 0} Data`}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Total Keseluruhan Baris Catatan
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rincian:</span>
            <span className="font-medium text-slate-600">
              {info?.counts?.kasMasjid || 0} Kas • {info?.counts?.suratKeluar || 0} Keluar • {info?.counts?.suratMasuk || 0} Masuk
            </span>
          </div>
        </div>
      </div>

      {/* 3. Opsi Unduh Cadangan Data (3 Pilihan) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Unduh Salinan Cadangan (Backup)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Opsi 1: Backup Lengkap (Rekomendasi) */}
          <div className="bg-gradient-to-b from-white to-emerald-50/50 backdrop-blur-md rounded-3xl p-6 border-2 border-emerald-500/40 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
              Sangat Disarankan
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Cadangan Penuh (Paket ZIP)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mengompresi file database SQLite (`dev.db`) bersama dengan <strong>seluruh file arsip surat, bukti foto nota kas, dan berkas upload</strong> dalam 1 file `.zip`.
                </p>
              </div>

              <div className="p-3 bg-emerald-100/50 rounded-2xl border border-emerald-200/60 text-[11px] text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Isi Arsip ZIP:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5">
                  <li>Database SQLite lengkap (`dev.db`)</li>
                  <li>Folder arsip (`arsip-uploads/`)</li>
                  <li>Metadata & ringkasan cadangan</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleDownload("all")}
              disabled={downloadingType === "all"}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingType === "all" ? "Menyiapkan File ZIP..." : "Unduh Cadangan Lengkap (ZIP)"}</span>
            </button>
          </div>

          {/* Opsi 2: Database SQLite Saja */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Database Saja (`dev.db`)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hanya mengunduh satu file database SQLite asli. Ukuran sangat ringan, cocok untuk cadangan rutin harian atau mingguan.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Menyimpan Seluruh Data Teks:</div>
                <p className="leading-snug">
                  Akun pengguna, pembukuan kas, data surat keluar/masuk, susunan pengurus, jadwal kegiatan, dan aspirasi jamaah.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload("database")}
              disabled={downloadingType === "database"}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingType === "database" ? "Mengunduh..." : "Unduh Database (.db)"}</span>
            </button>
          </div>

          {/* Opsi 3: Berkas Arsip Uploads Saja */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Berkas Arsip Fisik Saja
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mengunduh seluruh berkas dokumen hasil scan PDF surat masuk, bukti foto nota kas, file stempel takmir, dan QRIS dalam file ZIP.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Direktori Penyimpanan:</div>
                <p className="font-mono text-[10px] text-slate-500">public/uploads/*</p>
                <p className="leading-snug">
                  Total {info?.uploads?.count || 0} berkas dokumen fisik ({info?.uploads?.sizeFormatted || "0 B"}).
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload("uploads")}
              disabled={downloadingType === "uploads"}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingType === "uploads" ? "Mengompresi..." : "Unduh Berkas Arsip (ZIP)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bagian Pemulihan / Restore Database */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Pemulihan Database (Restore)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan fitur ini jika Anda ingin mengembalikan data dari file cadangan SQLite (`.db`) yang telah disimpan sebelumnya.
            </p>
          </div>
        </div>

        {/* Notifikasi Sukses / Error */}
        {restoreSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p>{restoreSuccess}</p>
              <p className="text-xs text-emerald-700 mt-0.5 font-normal">
                Snapshot cadangan otomatis sebelum penimpaan telah disimpan dengan aman di server (`prisma/backups/`).
              </p>
            </div>
          </div>
        )}

        {restoreError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p>{restoreError}</p>
            </div>
          </div>
        )}

        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Peringatan Penting:</strong> Memulihkan database akan menimpa data kas, surat, dan konfigurasi yang sedang aktif dengan data yang ada di dalam file cadangan. Sistem akan otomatis membuat cadangan darurat sebelum penimpaan dilakukan.
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (restoreFile) {
              setConfirmModal(true);
            }
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
        >
          <input
            type="file"
            accept=".db"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setRestoreFile(e.target.files[0]);
              }
            }}
            className="flex-1 text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 file:cursor-pointer border border-slate-200 rounded-2xl p-1.5 bg-white"
          />

          <button
            type="submit"
            disabled={!restoreFile || restoring}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Pulihkan Database</span>
          </button>
        </form>
      </div>

      {/* 5. SOP & Panduan Backup Berkala */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Info className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Panduan & Standar Operasional Pencadangan (SOP)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                1
              </span>
              <span>Jadwal Rutin</span>
            </div>
            <p className="leading-relaxed">
              Disarankan untuk mengunduh <strong>Cadangan Penuh (ZIP)</strong> minimal <strong>1 kali setiap akhir pekan</strong> atau setelah takmir menyelesaikan pencatatan kas mingguan/bulanan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                2
              </span>
              <span>Penyimpanan Eksternal</span>
            </div>
            <p className="leading-relaxed">
              Simpan file cadangan hasil unduhan ke media penyimpanan di luar server, seperti <strong>Google Drive resmi masjid</strong>, harddisk eksternal, atau flashdisk khusus sekretariat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                3
              </span>
              <span>Migrasi Server / Hosting</span>
            </div>
            <p className="leading-relaxed">
              Jika hendak memindahkan web ke VPS atau server lain, cukup unduh paket ZIP ini, lalu ekstrak kembali `dev.db` ke folder `prisma/` dan arsip berkas ke folder `public/uploads/`.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Restore */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Konfirmasi Pemulihan Database
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda akan mengganti seluruh database saat ini dengan file cadangan:
                <br />
                <strong className="text-slate-900 font-mono block mt-1 bg-slate-100 p-1.5 rounded-lg">
                  {restoreFile?.name}
                </strong>
                Data yang belum dicadangkan akan ditimpa. Apakah Anda yakin ingin melanjutkan?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                disabled={restoring}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRestoreSubmit}
                disabled={restoring}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition active:scale-95 flex items-center gap-2"
              >
                {restoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memulihkan...</span>
                  </>
                ) : (
                  <span>Ya, Pulihkan Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
