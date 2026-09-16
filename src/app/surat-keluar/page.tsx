"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  PlusCircle,
  Search,
  Printer,
  Trash2,
  Edit,
  Eye,
  FileText,
  Calendar,
  X,
  CheckCircle2,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";
import SuratPreview from "@/components/SuratPreview";

export default function ArsipSuratKeluarPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedSurat, setSelectedSurat] = useState<any | null>(null);
  const [setting, setSetting] = useState<any>(null);

  const fetchSuratKeluar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "Semua") params.append("status", statusFilter);

      const res = await fetch(`/api/surat-keluar?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuratKeluar();
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSetting)
      .catch(console.error);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuratKeluar();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus surat ini dari arsip?")) {
      return;
    }

    try {
      const res = await fetch(`/api/surat-keluar/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
        if (selectedSurat?.id === id) setSelectedSurat(null);
      } else {
        alert("Gagal menghapus surat");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Arsip Surat Keluar
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Riwayat seluruh surat keluar yang pernah dibuat. Anda dapat melihat kembali, mencetak ulang, atau mengeditnya.
          </p>
        </div>

        <Link
          href="/surat-keluar/buat"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Surat Baru
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 flex-1 min-w-[280px]"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor surat, perihal, atau tujuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#16171b] text-white text-xs font-semibold rounded-2xl hover:bg-black transition shadow-sm"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {["Semua", "Final", "Draft"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Surat</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Perihal</th>
                <th className="py-3.5 px-4">Tujuan / Penerima</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat daftar arsip surat keluar...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada arsip surat keluar yang ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((surat) => (
                  <tr
                    key={surat.id}
                    className="hover:bg-slate-50/60 transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {surat.nomorSurat}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatIndoDate(surat.tanggalSurat)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {surat.perihal}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {surat.tujuan}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          surat.status === "Final"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {surat.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSurat(surat)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                          title="Lihat & Cetak Surat (F4)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/surat-keluar/${surat.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                          title="Edit Surat"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(surat.id)}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                          title="Hapus Surat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Surat Keluar */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:static print:p-0 print:bg-transparent print:backdrop-blur-none print:block">
          <div className="bg-[#eaecf0] rounded-3xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:bg-transparent print:p-0 print:border-none print:shadow-none print:w-full print:block print:max-h-none print:overflow-visible">
            {/* Modal Header */}
            <div className="no-print bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Pratinjau Surat: {selectedSurat.nomorSurat}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSurat.perihal}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSurat(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with F4 Preview */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-200/70 print:p-0 print:bg-transparent print:block print:overflow-visible">
              <SuratPreview
                surat={selectedSurat}
                setting={setting || {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
