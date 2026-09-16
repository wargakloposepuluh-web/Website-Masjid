"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  Inbox,
  Clock,
  ChevronRight,
  Plus,
  Download,
  FileText,
  ArrowUpRight,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { formatIndoDate, formatRupiah } from "@/lib/utils";

interface DashboardData {
  totalSuratKeluar: number;
  totalSuratMasuk: number;
  pendingDisposisi: number;
  recentSuratKeluar: Array<{
    id: number;
    nomorSurat: string;
    perihal: string;
    tujuan: string;
    tanggalSurat: string;
    status: string;
  }>;
  recentSuratMasuk: Array<{
    id: number;
    nomorAgenda: string;
    nomorSurat: string;
    pengirim: string;
    perihal: string;
    tanggalTerima: string;
    status: string;
    fileUrl?: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [keuangan, setKeuangan] = useState<{ totalSaldo: number; saldoJariyah: number; saldoInfaq: number } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal load dashboard:", err);
        setLoading(false);
      });

    fetch("/api/keuangan/stats")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((json) => {
        if (json) setKeuangan(json);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-[#111317]">
      {/* 1. HEADER RINGKAS & TOMBOL AKSI UTAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Persuratan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistem Administrasi & Pengarsipan Persuratan Masjid Baitul Maghfirah
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(data?.pendingDisposisi ?? 0) > 0 && (
            <Link
              href="/surat-masuk"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition shadow-sm"
              title="Surat masuk yang belum diproses"
            >
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span>{data?.pendingDisposisi} Surat Perlu Tindak Lanjut</span>
            </Link>
          )}

          <Link
            href="/surat-keluar/buat"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white px-5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Baru</span>
          </Link>
        </div>
      </div>

      {/* 2. KARTU STATISTIK UTAMA */}
      <div className={`grid grid-cols-1 ${keuangan ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"} gap-4 sm:gap-5`}>
        {/* Card 1: Surat Keluar */}
        <Link
          href="/surat-keluar"
          className="group bg-white/50 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 hover:bg-white/75 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#16171b] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Surat Keluar</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : data?.totalSuratKeluar ?? 0}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Arsip</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Card 2: Surat Masuk */}
        <Link
          href="/surat-masuk"
          className="group bg-white/50 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 hover:bg-white/75 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Surat Masuk</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : data?.totalSuratMasuk ?? 0}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Agenda</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Card 3: Perlu Disposisi */}
        <Link
          href="/surat-masuk"
          className="group bg-white/50 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 hover:bg-white/75 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Perlu Disposisi</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : data?.pendingDisposisi ?? 0}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
              (data?.pendingDisposisi ?? 0) > 0
                ? "bg-orange-100 text-orange-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {(data?.pendingDisposisi ?? 0) > 0 ? "Perlu Tindakan" : "Tertib"}
            </span>
          </div>
        </Link>

        {/* Card 4: Kas Masjid */}
        {keuangan && (
          <Link
            href="/keuangan"
            className="group bg-white/50 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 hover:bg-white/75 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">Total Kas Masjid</p>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 truncate">
                  {formatRupiah(keuangan.totalSaldo)}
                </h3>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                <span>Buka Kas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* 3. DUA KOLOM AKTIVITAS TERBARU (Seimbang 50:50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom Kiri: Riwayat Surat Keluar */}
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Surat Keluar Terbaru
              </h3>
            </div>
            <Link
              href="/surat-keluar"
              className="text-xs font-semibold text-emerald-700 hover:text-orange-600 flex items-center gap-1 transition"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100/80">
            {loading ? (
              <p className="text-xs text-slate-400 py-8 text-center">Memuat riwayat...</p>
            ) : !data?.recentSuratKeluar?.length ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <p>Belum ada surat keluar yang dibuat.</p>
                <Link
                  href="/surat-keluar/buat"
                  className="inline-block text-emerald-700 font-semibold hover:underline"
                >
                  + Buat Surat Pertama
                </Link>
              </div>
            ) : (
              data.recentSuratKeluar.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/40 rounded-xl px-2 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.perihal}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {item.nomorSurat} • {formatIndoDate(item.tanggalSurat)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                      item.status === "Final"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {item.status}
                    </span>
                    <Link
                      href="/surat-keluar"
                      className="p-1 text-slate-400 hover:text-slate-800"
                      title="Lihat di Arsip"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Surat Masuk Terbaru */}
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Surat Masuk Terbaru
              </h3>
            </div>
            <Link
              href="/surat-masuk"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
            >
              <span>Buka Agenda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100/80">
            {loading ? (
              <p className="text-xs text-slate-400 py-8 text-center">Memuat agenda...</p>
            ) : !data?.recentSuratMasuk?.length ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <p>Belum ada catatan surat masuk.</p>
                <Link
                  href="/surat-masuk"
                  className="inline-block text-orange-600 font-semibold hover:underline"
                >
                  + Catat Surat Masuk
                </Link>
              </div>
            ) : (
              data.recentSuratMasuk.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/40 rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.pengirim}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.perihal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {formatIndoDate(item.tanggalTerima)}
                    </span>
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition"
                        title="Unduh Berkas Lampiran"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href="/surat-masuk"
                      className="p-1 text-slate-400 hover:text-slate-800"
                      title="Buka Detail di Agenda"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
